import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const VEHICLE_TYPES = ['2-wheeler', '3-wheeler', 'car', 'commercial'];

export class CreateVehicleDto {
  @IsIn(VEHICLE_TYPES)
  vehicleType: string;

  @IsOptional() @IsString() @MaxLength(80) brand?: string;
  @IsOptional() @IsString() @MaxLength(80) model?: string;
  @IsOptional() @IsNumber() @Min(0) batteryCapacity?: number;
  @IsOptional() @IsNumber() @Min(0) rangeKm?: number;
  @IsOptional() @IsString() @MaxLength(30) connectorType?: string;
  @IsOptional() @IsString() @MaxLength(20) vehicleNumber?: string;
}

export class UpdateVehicleDto {
  @IsOptional() @IsIn(VEHICLE_TYPES) vehicleType?: string;
  @IsOptional() @IsString() @MaxLength(80) brand?: string;
  @IsOptional() @IsString() @MaxLength(80) model?: string;
  @IsOptional() @IsNumber() @Min(0) batteryCapacity?: number;
  @IsOptional() @IsNumber() @Min(0) rangeKm?: number;
  @IsOptional() @IsString() @MaxLength(30) connectorType?: string;
  @IsOptional() @IsString() @MaxLength(20) vehicleNumber?: string;
}
