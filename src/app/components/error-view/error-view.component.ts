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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiErrorInfo } from '@app/models/api-error-info.model';

@Component({
  selector: 'app-error-view',
  templateUrl: './error-view.component.html',
  styleUrls: ['./error-view.component.scss'],
})
export class ErrorViewComponent implements OnInit {
  apiError: ApiErrorInfo | null = null;
  lastActiveUrl = '';

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.apiError = window.history.state;
    this.lastActiveUrl = this.activatedRoute.snapshot.queryParams['last'];
  }

  retryLastActiveUrlAgain() {
    if (this.lastActiveUrl) {
      this.router.navigateByUrl(this.lastActiveUrl);
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
