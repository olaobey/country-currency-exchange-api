import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from '../country/country.entity';
import { Repository } from 'typeorm';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Country) private readonly repo: Repository<Country>,
  ) {}

  async generateSummaryImage(totalCountries: number, refreshedAt: Date) {
    // Query top 5 by estimated_gdp
    const top = await this.repo
      .createQueryBuilder('c')
      .where('c.estimated_gdp IS NOT NULL')
      .orderBy('c.estimated_gdp', 'DESC')
      .limit(5)
      .getMany();

    const width = 1100;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.font = 'bold 40px Sans';
    ctx.fillText('Country Summary', 40, 60);

    ctx.font = '24px Sans';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(`Total Countries: ${totalCountries}`, 40, 110);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Last Refresh: ${refreshedAt.toISOString()}`, 40, 150);

    // Table header
    ctx.font = 'bold 28px Sans';
    ctx.fillStyle = '#fde68a';
    ctx.fillText('Top 5 by Estimated GDP', 40, 210);

    const headers = [
      '#',
      'Country',
      'Currency',
      'Exchange Rate',
      'Estimated GDP',
    ];
    ctx.font = 'bold 20px Sans';
    ctx.fillStyle = '#f1f5f9';
    const x = [40, 100, 520, 680, 870];
    headers.forEach((h, i) => ctx.fillText(h, x[i], 250));

    // Rows
    ctx.font = '18px Sans';
    ctx.fillStyle = '#cbd5e1';

    top.forEach((c, idx) => {
      const y = 290 + idx * 40;
      ctx.fillText(String(idx + 1), x[0], y);
      ctx.fillText(c.name, x[1], y);
      ctx.fillText(c.currency_code ?? '-', x[2], y);
      ctx.fillText(
        c.exchange_rate != null ? c.exchange_rate.toFixed(2) : '-',
        x[3],
        y,
      );
      ctx.fillText(
        c.estimated_gdp != null
          ? c.estimated_gdp.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })
          : '-',
        x[4],
        y,
      );
    });

    // Save (note: @napi-rs/canvas returns a Buffer via encode)
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const pngBuffer = await canvas.encode('png'); // <-- difference from node-canvas
    await fs.promises.writeFile(path.join(cacheDir, 'summary.png'), pngBuffer);
  }
}
