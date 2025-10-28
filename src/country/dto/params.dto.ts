import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CountryNameParamDto {
  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  name!: string;
}
