import { IsRFC3339, IsUUID } from 'class-validator';

export class BookingDto {
  @IsUUID()
  parkingSpotId: string;

  @IsRFC3339()
  start: string;

  @IsRFC3339()
  end: string;
}
