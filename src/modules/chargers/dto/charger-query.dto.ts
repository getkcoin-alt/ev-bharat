import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

const toNumber = ({ value }: { value: unknown }) => (value !== undefined ? Number(value) : value);

export class NearbyQueryDto {
  @Transform(toNumber) @IsNumber() @Min(-90) @Max(90) lat: number;
  @Transform(toNumber) @IsNumber() @Min(-180) @Max(180) lng: number;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) @Max(200) radius?: number = 25;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) @Max(100) perPage?: number = 20;
}

export class ChargerSearchDto {
  @IsString() q: string;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) @Max(100) perPage?: number = 20;
}

export class ChargerFilterDto {
  @IsOptional() @IsString() connector?: string;
  @IsOptional() @IsString() operator?: string;
  @IsOptional() @IsIn(['fast', 'slow']) chargerType?: string;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) @Max(5) minRating?: number;
  @IsOptional() @IsIn(['active', 'inactive']) status?: string;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Transform(toNumber) @IsNumber() @Min(1) @Max(100) perPage?: number = 20;
}
