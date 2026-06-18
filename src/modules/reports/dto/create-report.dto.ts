import { IsIn, IsOptional, IsString } from 'class-validator';

const ISSUE_TYPES = [
  'not_working', 'wrong_location', 'wrong_price', 'charger_removed',
  'payment_issue', 'connector_issue', 'long_waiting', 'unsafe_location', 'other',
];

export class CreateReportDto {
  @IsIn(ISSUE_TYPES) issueType: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() photo?: string;
}
