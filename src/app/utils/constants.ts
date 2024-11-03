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

import { AppStatus, AppStatusColors } from "@app/models/app-status.model";

export const DEFAULT_PARTITION_VALUE = '';
export const DEFAULT_PROTOCOL = 'http:';
export const NOT_AVAILABLE = 'n/a';
export const PARTITION_DEFAULT = 'default';
export const DEFAULT_BAR_COLOR = 'rgba(66, 133, 244, 1)';
export const CHART_COLORS = ['rgba(66, 133, 244, 1)', 'rgb(219, 68, 55, 1)', 'rgb(244, 180, 0, 1)', 'rgb(15, 157, 88, 1)', 'rgb(255, 109, 0, 1)', 'rgb(57, 73, 171, 1)', 'rgb(250, 204, 84, 1)', 'rgb(38, 187, 240, 1)', 'rgb(204, 97, 100, 1)', 'rgb(96, 206, 165, 1)']

export const APP_STATUSES: AppStatus[] = ['New', 'Accepted', 'Starting', 'Running', 'Rejected', 'Completing', 'Completed', 'Failing', 'Failed', 'Expired', 'Resuming'];

export const APP_STATUS_COLOR_MAP: AppStatusColors = {
    New: "#facc54",
    Accepted: "#f4b400",
    Starting: "#26bbf0",
    Running: "#234378",
    Completing: "#60cea5",
    Completed: "#0f9d58",
    Rejected: "#ff6d00",
    Failing: "#cc6164",
    Failed: "#db4437",
    Expired: "#3949ab",
    Resuming: "#694cb5"
}