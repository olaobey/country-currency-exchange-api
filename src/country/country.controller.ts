import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { QueryCountriesDto } from './dto/query-countries.dto';
import { CountryNameParamDto } from './dto/params.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('countries')
@Controller()
export class CountryController {
  constructor(private readonly service: CountryService) {}

  @Post('countries/refresh')
  @ApiOperation({
    summary:
      'Fetch all countries and USD rates, then cache them in DB; generate summary image.',
  })
  async refresh() {
    const ok = await this.service.refresh();
    return {
      ok: true,
      total_countries: ok.totalCountries,
      last_refreshed_at: ok.lastRefreshedAt.toISOString(),
    };
  }

  @Get('countries')
  @ApiOkResponse({
    description:
      'List countries (filters: region, currency; sorting: gdp_desc|gdp_asc|name_asc|name_desc).',
  })
  async list(@Query() q: QueryCountriesDto) {
    return this.service.findAll(q);
  }

  @Get('countries/image')
  async getImage(@Res() res: Response) {
    const imgPath = path.join(process.cwd(), 'cache', 'summary.png');
    if (!fs.existsSync(imgPath)) {
      res.status(404).json({ error: 'Summary image not found' });
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    return res.sendFile(imgPath);
  }

  @Get('countries/:name')
  async getOne(@Param() p: CountryNameParamDto) {
    const c = await this.service.findByName(p.name);
    if (!c)
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
    return c;
  }

  @Delete('countries/:name')
  async deleteOne(@Param() p: CountryNameParamDto) {
    const deleted = await this.service.deleteByName(p.name);
    if (!deleted)
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
    return { ok: true };
  }
}
