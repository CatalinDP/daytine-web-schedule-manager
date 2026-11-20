import { Pipe, PipeTransform } from '@angular/core';

import { STRINGS } from '../mocks/strings';
import { formatTimeDuration, formatTimeRange, TimeValue } from './time';

@Pipe({
  name: 'timeDuration',
})
export class TimeDurationPipe implements PipeTransform {
  private readonly units = STRINGS.time;

  transform(start: TimeValue, end: TimeValue): string {
    return formatTimeDuration(start, end, this.units.hourUnit, this.units.minuteUnit);
  }
}

@Pipe({
  name: 'timeRange',
})
export class TimeRangePipe implements PipeTransform {
  transform(start: TimeValue, end: TimeValue): string {
    return formatTimeRange(start, end);
  }
}
