import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from './country/country.module';
import { StatusModule } from './status/status.module';
import { ImageModule } from './image/image.module';
import { Country } from './country/country.entity';
import { AppStatus } from './status/status.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [Country, AppStatus],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
    CountryModule,
    StatusModule,
    ImageModule,
  ],
})
export class AppModule {}
