import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string

  @IsInt()
  @Min(1)
  amount: number

  @IsString()
  @IsNotEmpty()
  currency: string

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string
}
