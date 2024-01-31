import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { ParkingSpotEntity } from './parking-spot.entity';

export enum CustomerRoleEnum {
  ADMIN = 'admin',
  STANDARD = 'standard',
}

@Entity('booking')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => CustomerEntity,
    (customer: CustomerEntity) => customer.bookings,
  )
  @JoinColumn({ name: 'customer' })
  customer: CustomerEntity;

  @ManyToOne(
    () => ParkingSpotEntity,
    (spot: ParkingSpotEntity) => spot.bookings,
  )
  @JoinColumn({ name: 'parkingSpot' })
  parkingSpot: ParkingSpotEntity;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
