import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { CheckoutsService } from './checkouts.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'
import { IdempotentReplay } from '../common/exceptions/idempotent-replay.exception'


@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    const result = await this.checkoutsService.createCheckout(dto)
  
    if (!result.created) {
      throw new IdempotentReplay(result.checkout)
    }
  
    return result.checkout
  }
  
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id') id: string) {
    return this.checkoutsService.getCheckout(id)
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.ACCEPTED)
  async pay(@Param('id') id: string) {
    return this.checkoutsService.processPayment(id)
  }
}
