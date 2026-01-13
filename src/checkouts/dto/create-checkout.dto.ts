import { IsInt, IsEnum, Max, IsNotEmpty, IsString, Min } from 'class-validator'
import { Currency } from '../enums/currency.enums'


export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string

  @IsInt()
  @Min(1)
  @Max(100000000)
  amount: number // in cents

  @IsEnum(Currency, { message: 'Currency must be either CAD or USD' })
  @IsNotEmpty()
  currency: Currency

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string
}
