import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = { error: 'Internal server error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse();
      if (typeof r === 'string') {
        body = { error: r };
      } else {
        body = r;
      }
      // Map validation errors to requested format
      if (status === HttpStatus.BAD_REQUEST && body?.message) {
        const details = Array.isArray(body.message)
          ? body.message
          : [body.message];
        body = {
          error: 'Validation failed',
          details: details.reduce((acc: any, m: string) => {
            const [field, ...rest] = m.split(' ');
            acc[field] = rest.join(' ') || 'is invalid';
            return acc;
          }, {}),
        };
      }
    }

    // Consistent 404/400/500/503 shape if not explicitly set
    if (status === 404 && !body?.error) body = { error: 'Country not found' };
    if (status === 400 && !body?.error) body = { error: 'Validation failed' };
    if (status === 503 && !body?.error) body = { error: 'Service Unavailable' };
    if (status === 500 && !body?.error)
      body = { error: 'Internal server error' };

    res.status(status).json(body);
  }
}
