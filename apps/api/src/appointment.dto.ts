import { Transform } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
export class AppointmentDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 80)
  @Matches(/^[^\r\n\x00-\x1f<>]+$/u)
  name!: string;
  @Matches(/^(?:\+91)?[6-9]\d{9}$/) phone!: string;
  @IsOptional() @IsEmail() @MaxLength(254) email?: string;
  @IsIn(['siddha', 'ayurveda', 'varma', 'unsure']) service!: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) date!: string;
  @Matches(/^\d{2}:(00|30)$/) time!: string;
  @Equals(true) consent!: boolean;
  @IsString() @MaxLength(0) website!: string;
  @IsIn(['en', 'ta']) language!: string;
  @IsUUID('4') requestId!: string;
}
