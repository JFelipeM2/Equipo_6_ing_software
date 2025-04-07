import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T[]>>
{
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T[]>> {
    return next.handle().pipe(
      map((data) => ({
        date: new Date().toISOString(),
        size: Array.isArray(data) ? data.length : [data].length,
        data: Array.isArray(data) ? data : [data],
      })),
    );
  }
}
