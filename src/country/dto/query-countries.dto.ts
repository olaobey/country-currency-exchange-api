import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryCountriesDto {
  @ApiPropertyOptional({ example: 'Africa' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    example: 'gdp_desc',
    enum: ['gdp_desc', 'gdp_asc', 'name_asc', 'name_desc'],
  })
  @IsOptional()
  @IsIn(['gdp_desc', 'gdp_asc', 'name_asc', 'name_desc'])
  sort?: 'gdp_desc' | 'gdp_asc' | 'name_asc' | 'name_desc';
}
