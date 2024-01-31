import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Headers,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AppService } from './app.service';
import { BookingDto } from './booking.dto';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Post()
  async createBooking(
    @Headers('Auth') auth: string,
    @Body() booking: BookingDto,
  ) {
    return this.service.createBooking(auth, booking);
  }

  @Get(':id')
  async getBooking(
    @Headers('Auth') auth: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getBooking(auth, id);
  }

  @Put(':id')
  async updateBooking(
    @Headers('Auth') auth: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() booking: BookingDto,
  ) {
    return this.service.updateBooking(auth, id, booking);
  }

  @Delete(':id')
  async deleteBooking(
    @Headers('Auth') auth: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.deleteBooking(auth, id);
  }
}
