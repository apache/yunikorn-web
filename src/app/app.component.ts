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
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { debounceTime, filter } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

import { EventBusService, EventMap } from '@app/services/event-bus/event-bus.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isNavOpen = true;
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventBus: EventBusService
  ) {}

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.generateBreadcrumb();
    });

    fromEvent(window, 'resize')
      .pipe(debounceTime(500))
      .subscribe(() => this.eventBus.publish(EventMap.WindowResizedEvent));
  }

  generateBreadcrumb() {
    this.breadcrumbs = [];
    let url = '';
    let currentRoute: ActivatedRoute | null = this.route.root;

    do {
      const childrenRoutes = currentRoute.children;
      currentRoute = null;
      childrenRoutes.forEach((route) => {
        if (route.outlet === 'primary') {
          const routeSnapshot = route.snapshot;
          if (routeSnapshot) {
            url += '/' + routeSnapshot.url.map((segment) => segment.path).join('/');
            if (!!route.snapshot.data['breadcrumb']) {
              this.breadcrumbs.push({
                label: route.snapshot.data['breadcrumb'].includes(':')
                  ? this.getResourceName(
                      route.snapshot.data['breadcrumb'],
                      routeSnapshot.params,
                      route.snapshot.data['breadcrumb'].split(':')[1]
                    )
                  : route.snapshot.data['breadcrumb'],
                url,
              });
              if (route.snapshot.data['prependRoot']) {
                this.breadcrumbs.unshift({
                  label: 'Dashboard',
                  url: '/',
                });
              }
            }
          }
          currentRoute = route;
        }
      });
    } while (currentRoute);
  }

  getResourceName(label: string, params: Record<string, any>, routeParam: string) {
    return label.replace(`:${routeParam}`, params[routeParam]);
  }

  toggleNavigation() {
    this.isNavOpen = !this.isNavOpen;
    setTimeout(() => {
      this.eventBus.publish(EventMap.LayoutChangedEvent);
    }, 1000);
  }

  openYuniKornHelp(url: string) {
    const fullUrl = `http://yunikorn.apache.org${url}`;
    window.open(fullUrl, '_blank');
  }
}
