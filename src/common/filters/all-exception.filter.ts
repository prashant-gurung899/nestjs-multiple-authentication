import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface IErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    const errorResponse: IErrorResponse = {
      success: false,
      statusCode,
      message,
      data: {},
    };

    response.status(statusCode).json(errorResponse);
  }
}
