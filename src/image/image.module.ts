import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from '../country/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
