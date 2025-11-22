import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ServerResponse } from 'http';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;
    const now = Date.now();

    this.logger.log(`➡️  ${method} ${originalUrl} called`);

    return next.handle().pipe(
      tap((response: ServerResponse) => {
        // Log response
        this.logger.log(
          `⬅️  ${method} [${response.statusCode}] ${originalUrl} completed in ${Date.now() - now}ms`,
        );
      }),
      catchError((err) => {
        // Log error
        const status = err?.status || 'N/A';
        const message = err?.message || err;
        this.logger.error(
          `❌ ${method} [${status}] ${originalUrl} failed in ${Date.now() - now}ms | message=${JSON.stringify(
            message,
          )}`,
        );
        return throwError(() => err);
      }),
    );
  }
}
