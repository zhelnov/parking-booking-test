import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BookingEntity } from './booking.entity';

export enum CustomerRoleEnum {
  ADMIN = 'admin',
  STANDARD = 'standard',
}

@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: CustomerRoleEnum })
  role: CustomerRoleEnum;

  @Column()
  token: string;

  @OneToMany(() => BookingEntity, (book: BookingEntity) => book.customer, {
    onDelete: 'CASCADE',
  })
  bookings: BookingEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
