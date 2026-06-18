import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() reviewText?: string;
  @IsOptional() @IsInt() @Min(0) waitingTime?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) cleanlinessRating?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) safetyRating?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) staffRating?: number;
  @IsOptional() @IsBoolean() chargerWorking?: boolean;
  @IsOptional() @IsString() photo?: string;
}
