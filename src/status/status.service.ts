import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppStatus } from './status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(AppStatus) private readonly repo: Repository<AppStatus>,
  ) {}

  async getStatus() {
    const s = await this.repo.findOne({ where: { id: 1 } });
    return {
      total_countries: s?.total_countries ?? 0,
      last_refreshed_at: s?.last_refreshed_at
        ? s.last_refreshed_at.toISOString()
        : null,
    };
  }
}
