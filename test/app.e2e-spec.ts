import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { Server } from 'http';
import { Repository } from 'typeorm';

import { CustomerEntity, ParkingSpotEntity } from '../src/entities';

import { getTestModule } from './test-module';
import { CustomerRoleEnum } from '../src/entities/customer.entity';

describe('parking app test (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  let customerRepo: Repository<CustomerEntity>;
  let spotRepo: Repository<ParkingSpotEntity>;

  beforeAll(async () => {
    const testMeta = await getTestModule();
    app = testMeta.app;
    server = testMeta.server;
    customerRepo = testMeta.customerRepo;
    spotRepo = testMeta.spotRepo;

    await testMeta.bookingRepo.delete({});
    await spotRepo.delete({});
    await customerRepo.delete({});

    await customerRepo.save({
      firstName: 'User',
      lastName: 'Regular',
      email: 'user@user.com',
      role: CustomerRoleEnum.STANDARD,
      token: 'userToken',
    });
    await customerRepo.save({
      firstName: 'Admin',
      lastName: 'Super',
      email: 'admin@admin.com',
      role: CustomerRoleEnum.ADMIN,
      token: 'adminToken',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Should check auth', async () => {
    await request(server)
      .get('/099687f0-71f2-4d8f-81b1-a7520fd0033f')
      .set('Auth', 'invalidtoken')
      .expect(HttpStatus.UNAUTHORIZED);
    await request(server)
      .get('/099687f0-71f2-4d8f-81b1-a7520fd0033f')
      .set('Auth', 'userToken')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('Should do some flow', async () => {
    const spot = await spotRepo.save({ name: 'first' });

    let start = new Date(Date.now() + 200000).toISOString();
    let end = new Date(Date.now() + 500000).toISOString();

    // bad time
    await request(server)
      .post('')
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start,
        end: start,
      })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .post('')
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start,
        end,
      })
      .expect(HttpStatus.CREATED);

    // occupied time
    await request(server)
      .post('')
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start,
        end,
      })
      .expect(HttpStatus.BAD_REQUEST);

    start = new Date(Date.now() + 600000).toISOString();
    end = new Date(Date.now() + 800000).toISOString();

    const response = await request(server)
      .post('')
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start,
        end,
      })
      .expect(HttpStatus.CREATED);

    await request(server)
      .get(`/${response.body.id}`)
      .set('Auth', 'adminToken')
      .expect(HttpStatus.OK);

    // user cant access another user's bookings
    await request(server)
      .get(`/${response.body.id}`)
      .set('Auth', 'userToken')
      .expect(HttpStatus.NOT_FOUND);

    // edit to occupied time
    await request(server)
      .put(`/${response.body.id}`)
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start: new Date(Date.now() + 100000).toISOString(),
        end: new Date(Date.now() + 400000).toISOString(),
      })
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .put(`/${response.body.id}`)
      .set('Auth', 'adminToken')
      .send({
        parkingSpotId: spot.id,
        start,
        end: new Date(Date.now() + 900000).toISOString(),
      })
      .expect(HttpStatus.OK);

    await request(server)
      .delete(`/${response.body.id}`)
      .set('Auth', 'adminToken')
      .expect(HttpStatus.OK);

    // unavailable after delete
    await request(server)
      .get(`/${response.body.id}`)
      .set('Auth', 'adminToken')
      .expect(HttpStatus.NOT_FOUND);
  });
});
