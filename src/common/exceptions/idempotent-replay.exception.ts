import { HttpException } from '@nestjs/common'

export class IdempotentReplay extends HttpException {
  constructor(public readonly data: any) {
    data.replayed = true
    super(data, 200)
  }
}
