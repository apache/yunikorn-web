/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { ApiErrorInfo } from '@app/models/api-error-info.model';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(this.handleApiError.bind(this)));
  }

  handleApiError(response: HttpErrorResponse) {
    if (!this.router.url.startsWith('/error')) {
      this.router.navigate(['/error'], {
        queryParams: { last: this.router.url },
        state: this.parseErrorResponse(response.error),
      });
    }

    return throwError(() => response);
  }

  parseErrorResponse(error: any): ApiErrorInfo | undefined {
    if (error) {
      return {
        statusCode: error.StatusCode,
        message: error.Message,
        description: error.Description,
      };
    } else {
      return undefined;
    }
  }
}
