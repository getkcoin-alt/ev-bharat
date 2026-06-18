import { IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateHistoryDto {
  @IsOptional() @IsUUID() vehicleId?: string;
  @IsOptional() @IsUUID() stationId?: string;
  @IsOptional() @IsString() stationName?: string;
  @IsOptional() @IsString() vehicleLabel?: string;
  @IsDateString() chargingDate: string;
  @IsOptional() @IsNumber() @Min(0) unitsCharged?: number;
  @IsOptional() @IsNumber() @Min(0) amountPaid?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() notes?: string;
}
