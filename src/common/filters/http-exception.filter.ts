import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { IdempotentReplay } from '../exceptions/idempotent-replay.exception'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {      
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()

    if (exception instanceof IdempotentReplay) {
      response.status(200).json({
        success: true,
        data: exception.data,
      })
      return
    }

    const exceptionResponse = exception.getResponse()

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message

    response.status(status).json({
      success: false,
      data: { error: message },
    })
  }
}
