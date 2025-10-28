import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './country.entity';
import { DataSource, Repository } from 'typeorm';
import { QueryCountriesDto } from './dto/query-countries.dto';
import { AppStatus } from '../status/status.entity';
import { safeGet } from '../utils/axios';
import { computeEstimatedGdp, randomMultiplier } from '../utils/gdp';
import { ImageService } from '../image/image.service';

type CountryV2 = {
  name: string;
  capital?: string;
  region?: string;
  population: number;
  flag?: string;
  currencies?: { code?: string | null }[];
};

type CountryV3 = {
  name?: { common?: string };
  capital?: string[];
  region?: string;
  population?: number;
  flags?: { svg?: string; png?: string };
  currencies?: Record<string, { name?: string; symbol?: string }>;
};

type Unified = {
  name: string;
  capital: string | null;
  region: string | null;
  population: number;
  flag: string | null;
  currency_code: string | null;
};

type RatesAPI = {
  result: string;
  base_code: string; // "USD"
  time_last_update_unix: number;
  rates: Record<string, number>;
};
@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country) private readonly repo: Repository<Country>,
    @InjectRepository(AppStatus)
    private readonly statusRepo: Repository<AppStatus>,
    private readonly dataSource: DataSource,
    private readonly imageService: ImageService,
  ) {}

  async refresh() {
    const countriesUrl = process.env.COUNTRIES_API!;
    const ratesUrl = process.env.RATES_API!;

    let unified: Unified[];
    try {
      const v2 = await safeGet<CountryV2[]>(countriesUrl);
      unified = v2.map((c) => ({
        name: (c.name ?? '').trim(),
        capital: c.capital ?? null,
        region: c.region ?? null,
        population: Number(c.population ?? 0),
        flag: c.flag ?? null,
        currency_code: c.currencies?.[0]?.code ?? null,
      }));
    } catch {
      try {
        const v3 = await safeGet<CountryV3[]>(
          'https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,currencies',
        );
        unified = v3.map((c) => {
          const name = (c.name?.common ?? '').trim();
          const capital =
            Array.isArray(c.capital) && c.capital.length ? c.capital[0] : null;
          const flag = c.flags?.svg ?? c.flags?.png ?? null;
          const code = c.currencies
            ? (Object.keys(c.currencies)[0] ?? null)
            : null;
          return {
            name,
            capital,
            region: c.region ?? null,
            population: Number(c.population ?? 0),
            flag,
            currency_code: code,
          };
        });
      } catch {
        throw new HttpException(
          {
            error: 'External data source unavailable',
            details: 'Could not fetch data from Countries API',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    let ratesData: RatesAPI;
    try {
      ratesData = await safeGet<RatesAPI>(ratesUrl);
      if (!ratesData?.rates) throw new Error('No rates');
    } catch {
      throw new HttpException(
        {
          error: 'External data source unavailable',
          details: 'Could not fetch data from Exchange Rates API',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const rates = ratesData.rates || {};
    const now = new Date();

    const rows = unified
      .filter((u) => u.name)
      .map((u) => {
        const population = Number(u.population || 0);
        const currency_code = u.currency_code ?? null;

        let exchange_rate: number | null = null;
        let estimated_gdp: number | null = null;

        if (!currency_code) {
          exchange_rate = null;
          estimated_gdp = 0; // currencies empty -> gdp = 0
        } else if (rates[currency_code] == null) {
          exchange_rate = null;
          estimated_gdp = null; // code not found in rates -> null
        } else {
          exchange_rate = rates[currency_code];
          estimated_gdp =
            exchange_rate && exchange_rate > 0
              ? computeEstimatedGdp(population, exchange_rate)
              : null;
        }

        return {
          name: u.name,
          capital: u.capital,
          region: u.region,
          population: String(population), // entity uses bigint -> string
          currency_code,
          exchange_rate,
          estimated_gdp,
          flag_url: u.flag,
          last_refreshed_at: now,
        };
      });

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const CHUNK = 500;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        await qr.manager
          .createQueryBuilder()
          .insert()
          .into(Country)
          .values(slice)
          .onConflict(
            `("name") DO UPDATE SET
              "capital" = EXCLUDED."capital",
              "region" = EXCLUDED."region",
              "population" = EXCLUDED."population",
              "currency_code" = EXCLUDED."currency_code",
              "exchange_rate" = EXCLUDED."exchange_rate",
              "estimated_gdp" = EXCLUDED."estimated_gdp",
              "flag_url" = EXCLUDED."flag_url",
              "last_refreshed_at" = EXCLUDED."last_refreshed_at"`,
          )
          .execute();
      }

      const total = await qr.manager.count(Country);

      // upsert status row (id=1)
      await qr.manager
        .createQueryBuilder()
        .insert()
        .into(AppStatus)
        .values([{ id: 1, total_countries: total, last_refreshed_at: now }])
        .onConflict(
          `("id") DO UPDATE SET
            "total_countries" = EXCLUDED."total_countries",
            "last_refreshed_at" = EXCLUDED."last_refreshed_at"`,
        )
        .execute();

      await qr.commitTransaction();

      await this.imageService.generateSummaryImage(total, now);

      return { totalCountries: total, lastRefreshedAt: now };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e instanceof HttpException
        ? e
        : new HttpException(
            { error: 'Internal server error' },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    } finally {
      await qr.release();
    }
  }

  async findAll(q: QueryCountriesDto) {
    const qb = this.repo.createQueryBuilder('c');

    if (q.region) qb.andWhere('c.region = :region', { region: q.region });
    if (q.currency)
      qb.andWhere('c.currency_code = :currency', { currency: q.currency });

    // Sorting
    switch (q.sort) {
      case 'gdp_desc':
        qb.orderBy('c.estimated_gdp', 'DESC', 'NULLS LAST');
        break;
      case 'gdp_asc':
        qb.orderBy('c.estimated_gdp', 'ASC', 'NULLS LAST');
        break;
      case 'name_desc':
        qb.orderBy('c.name', 'DESC');
        break;
      default:
        qb.orderBy('c.name', 'ASC');
    }

    return qb.getMany();
  }

  async findByName(name: string) {
    return this.repo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name })
      .getOne();
  }

  async deleteByName(name: string) {
    const existing = await this.findByName(name);
    if (!existing) return false;
    await this.repo.remove(existing);
    return true;
  }

  async getStatus() {
    const s = await this.statusRepo.findOne({ where: { id: 1 } });
    return {
      total_countries: s?.total_countries ?? 0,
      last_refreshed_at: s?.last_refreshed_at
        ? s.last_refreshed_at.toISOString()
        : null,
    };
  }
}
