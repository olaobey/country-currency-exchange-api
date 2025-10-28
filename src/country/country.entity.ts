import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  capital: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'bigint' })
  population: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency_code: string | null;

  @Column({ type: 'double precision', nullable: true })
  exchange_rate: number | null;

  @Column({ type: 'double precision', nullable: true })
  estimated_gdp: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  flag_url: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_refreshed_at: Date | null;
}
