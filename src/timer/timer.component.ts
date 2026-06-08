import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() duration: number = 90;
  @Input() label: string = 'Time Remaining';
  @Input() autoStart: boolean = false;
  @Input() manualStart: boolean = false;
  @Input() topPx: number = 80;
  @Input() leftPx: number = 20;
  @Input() innerDuration: number | null = null;
  @Input() innerManualStart: boolean = false;
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timerTick = new EventEmitter<number>();
  @Output() innerTimerComplete = new EventEmitter<void>();

  currentCountdown: number = 0;
  innerCountdown: number = 0;
  innerHasStarted: boolean = false;
  private timerSubscription?: Subscription;
  private innerTimerSubscription?: Subscription;
  private hasStarted: boolean = false;

  ngOnInit() {
    if (!this.hasStarted) {
      this.currentCountdown = this.duration;
    }
    if (this.innerDuration !== null) {
      this.innerCountdown = this.innerDuration;
    }
    if (this.autoStart) {
      this.startTimer();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['manualStart']) {
      if (changes['manualStart'].currentValue === true && changes['manualStart'].previousValue !== true) {
        this.startTimer();
      } else if (changes['manualStart'].currentValue === false && changes['manualStart'].previousValue === true) {
        this.stopTimer();
      }
    }
    if (changes['innerManualStart']) {
      if (changes['innerManualStart'].currentValue === true && changes['innerManualStart'].previousValue !== true) {
        this.startInnerTimer();
      } else if (changes['innerManualStart'].currentValue === false && changes['innerManualStart'].previousValue === true) {
        this.stopInnerTimer();
      }
    }
    if (changes['duration']) {
      if (!this.hasStarted) {
        this.currentCountdown = this.duration;
      }
      this.stopInnerTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    this.stopInnerTimer();
  }

  startTimer() {
    this.stopTimer();
    this.hasStarted = true;
    this.currentCountdown = this.duration;
    this.timerSubscription = timer(0, 1000).pipe(
      map(n => this.duration - n),
      takeWhile(n => n >= 0)
    ).subscribe(time => {
      this.currentCountdown = time;
      this.timerTick.emit(time);
      if (time === 0) {
        this.timerComplete.emit();
      }
    });
  }

  startInnerTimer() {
    if (!this.innerDuration) return;
    this.stopInnerTimer();
    this.innerHasStarted = true;
    this.innerCountdown = this.innerDuration;
    this.innerTimerSubscription = timer(0, 1000).pipe(
      map(n => this.innerDuration! - n),
      takeWhile(n => n >= 0)
    ).subscribe(time => {
      this.innerCountdown = time;
      if (time === 0) {
        this.innerTimerComplete.emit();
      }
    });
  }

  stopTimer() {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.currentCountdown = this.duration;
    this.hasStarted = false;
  }

  stopInnerTimer() {
    this.innerTimerSubscription?.unsubscribe();
    this.innerTimerSubscription = undefined;
    this.innerHasStarted = false;
    if (this.innerDuration !== null) this.innerCountdown = this.innerDuration;
  }

  resetTimer() {
    this.startTimer();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeRemaining(): number {
    return this.currentCountdown;
  }

  isRunning(): boolean {
    return this.timerSubscription !== undefined && !this.timerSubscription.closed;
  }

  getProgressValue(): number {
    if (!this.hasStarted || this.duration === 0) return 100;
    return (this.currentCountdown / this.duration) * 100;
  }

  getInnerProgressValue(): number {
    if (!this.innerHasStarted || !this.innerDuration) return 100;
    return (this.innerCountdown / this.innerDuration) * 100;
  }

  getDisplayCountdown(): string {
    return this.innerHasStarted
      ? this.formatTime(this.innerCountdown)
      : this.formatTime(this.currentCountdown);
  }

  isWarning(): boolean {
    const active = this.innerHasStarted ? this.innerCountdown : this.currentCountdown;
    return active <= 10 && this.hasTimerStarted();
  }

  getDisplayLabel(): string {
    return this.hasStarted ? 'Time Remaining' : 'Start From Device';
  }

  hasTimerStarted(): boolean {
    return this.hasStarted;
  }
}
