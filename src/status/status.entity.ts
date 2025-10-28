import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('app_status')
export class AppStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  total_countries: number;

  @Column({ type: 'timestamptz', nullable: true })
  last_refreshed_at: Date | null;
}
