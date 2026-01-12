import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { CheckoutsService } from './checkouts.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'

@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}

  @Post()
  async create(@Body() dto: CreateCheckoutDto) {
    return this.checkoutsService.createCheckout(dto)
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.checkoutsService.getCheckout(id)
  }

  @Post(':id/pay')
  async pay(@Param('id') id: string) {
    return this.checkoutsService.processPayment(id)
  }
}
