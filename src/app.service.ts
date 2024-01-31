import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import * as moment from 'moment';

import { BookingEntity, CustomerEntity, ParkingSpotEntity } from './entities';
import { BookingDto } from './booking.dto';
import { CustomerRoleEnum } from './entities/customer.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(ParkingSpotEntity)
    private readonly parkingSpotRepo: Repository<ParkingSpotEntity>,
  ) {}

  async createBooking(auth: string, booking: BookingDto) {
    const customer = await this.getCustomerByToken(auth);

    await this.validateBooking(booking);

    return this.bookingRepo.save({
      customer,
      parkingSpot: { id: booking.parkingSpotId },
      start: moment(booking.start).toDate(),
      end: moment(booking.end).toDate(),
    });
  }

  async updateBooking(auth: string, id: string, booking: BookingDto) {
    await this.getBooking(auth, id);

    await this.validateBooking(booking, id);

    return this.bookingRepo.save({
      id,
      parkingSpot: { id: booking.parkingSpotId },
      start: moment(booking.start).toDate(),
      end: moment(booking.end).toDate(),
    });
  }

  async getBooking(auth: string, id: string) {
    const customer = await this.getCustomerByToken(auth);
    const booking = await this.bookingRepo.findOne({
      where: {
        id,
        ...(customer.role === CustomerRoleEnum.STANDARD ? { customer } : {}),
      },
    });
    if (!booking) {
      throw new NotFoundException(`booking ${id} not found`);
    }
    return booking;
  }

  async deleteBooking(auth: string, id: string) {
    const booking = await this.getBooking(auth, id);
    await this.bookingRepo.remove(booking);
  }

  private async getCustomerByToken(token: string, relations: string[] = []) {
    const customer = await this.customerRepo.findOne({
      where: { token },
      relations,
    });
    if (!customer) {
      throw new UnauthorizedException('bad auth');
    }
    return customer;
  }

  private async validateBooking(dto: BookingDto, modifyingId?: string) {
    const now = moment();
    const start = moment(dto.start);
    const end = moment(dto.end);
    if (now.isBetween(start, end) || end.isSameOrBefore(start)) {
      throw new BadRequestException('bad time');
    }

    const parkingSpot = await this.parkingSpotRepo.findOne({
      where: { id: dto.parkingSpotId },
    });
    if (!parkingSpot) {
      throw new NotFoundException('parking spot not found');
    }

    const overlaps = await this.bookingRepo.count({
      where: {
        ...(modifyingId ? { id: Not(modifyingId) } : {}),
        parkingSpot: { id: parkingSpot.id },
        start: Between(start.toDate(), end.toDate()),
      },
    });
    if (overlaps) {
      throw new BadRequestException(`selected time already booked`);
    }

    return true;
  }
}
