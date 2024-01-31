import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import {
  BookingEntity,
  CustomerEntity,
  ParkingSpotEntity,
} from '../src/entities';

export async function getTestModule() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();

  const customerRepo = moduleRef.get<Repository<CustomerEntity>>(
    getRepositoryToken(CustomerEntity),
  );

  const spotRepo = moduleRef.get<Repository<ParkingSpotEntity>>(
    getRepositoryToken(ParkingSpotEntity),
  );

  const bookingRepo = moduleRef.get<Repository<BookingEntity>>(
    getRepositoryToken(BookingEntity),
  );

  const server = app.getHttpServer();

  return {
    moduleRef,
    app,
    server,
    customerRepo,
    spotRepo,
    bookingRepo,
  };
}
