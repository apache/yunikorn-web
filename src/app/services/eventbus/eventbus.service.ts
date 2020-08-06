import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const EventMap = {
  LayoutChangedEvent: 'LAYOUT_CHANGED_EVENT'
};

interface EventRegistry {
  [eventName: string]: Subject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  private eventRegistry: EventRegistry = {};

  constructor() {}

  getEvent(eventName: string): Observable<any> {
    if (!this.eventRegistry[eventName]) {
      this.eventRegistry[eventName] = new Subject<any>();
    }

    const subject = this.eventRegistry[eventName];
    return subject.asObservable();
  }

  publish(eventName: string, data?: any) {
    const subject = this.eventRegistry[eventName];

    if (subject) {
      subject.next(data);
    }
  }
}
