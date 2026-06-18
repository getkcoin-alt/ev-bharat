import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSuggestionDto {
  @IsString() @MaxLength(200) chargerName: string;
  @IsOptional() @IsString() @MaxLength(120) operatorName?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsLatitude() latitude: number;
  @IsLongitude() longitude: number;
  @IsOptional() @IsString() @MaxLength(30) connectorType?: string;
  @IsOptional() @IsNumber() @Min(0) pricePerUnit?: number;
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsString() remarks?: string;
}
