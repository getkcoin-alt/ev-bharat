import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface PageMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface Envelope<T> {
  success: boolean;
  data: T;
  error: null;
  meta: PageMeta | null;
}

/** Wraps every successful response in { success, data, error, meta }. */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, Envelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Envelope<T>> {
    return next.handle().pipe(
      map((value) => {
        // Paged results carry { items, meta } — unwrap them.
        if (value && typeof value === 'object' && 'items' in value && 'meta' in value) {
          return {
            success: true,
            data: value.items,
            error: null,
            meta: value.meta as PageMeta,
          };
        }
        return { success: true, data: value, error: null, meta: null };
      }),
    );
  }
}
