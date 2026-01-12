import { Controller } from '@nestjs/common';
import { CheckoutsService } from './checkouts.service';

@Controller('checkouts')
export class CheckoutsController {
  constructor(private readonly checkoutsService: CheckoutsService) {}
}
