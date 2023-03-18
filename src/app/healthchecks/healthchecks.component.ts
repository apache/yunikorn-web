import { Component, Input, OnInit } from '@angular/core';
import { SchedulerHealthInfo } from "@app/models/scheduler-health-info.model";

@Component({
  selector: 'app-healthchecks',
  templateUrl: './healthchecks.component.html',
  styleUrls: ['./healthchecks.component.scss']
})

export class HealthchecksComponent implements OnInit {
  @Input() schedulerHealth: SchedulerHealthInfo = new SchedulerHealthInfo;

  constructor() { }

  ngOnInit(): void {
  }

}
