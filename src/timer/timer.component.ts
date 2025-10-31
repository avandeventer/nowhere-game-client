import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() duration: number = 90; // Duration in seconds
  @Input() label: string = 'Time Remaining';
  @Input() autoStart: boolean = false;
  @Input() manualStart: boolean = false; // New input to trigger manual start
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timerTick = new EventEmitter<number>();

  currentCountdown: number = 0;
  private timerSubscription?: Subscription;
  private hasStarted: boolean = false;

  ngOnInit() {
    // Initialize countdown to duration when not started
    if (!this.hasStarted) {
      this.currentCountdown = this.duration;
    }
    if (this.autoStart) {
      this.startTimer();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['manualStart'] && changes['manualStart'].currentValue && !this.hasStarted) {
      this.startTimer();
    }
    // Update countdown if duration changes and timer hasn't started
    if (changes['duration'] && !this.hasStarted) {
      this.currentCountdown = this.duration;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer(); // Stop any existing timer
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

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  resetTimer() {
    this.startTimer();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Public method to get current time remaining
  getTimeRemaining(): number {
    return this.currentCountdown;
  }

  // Public method to check if timer is running
  isRunning(): boolean {
    return this.timerSubscription !== undefined && !this.timerSubscription.closed;
  }

  // Get display label - show "Start From Device" if not started
  getDisplayLabel(): string {
    return this.hasStarted ? 'Time Remaining' : 'Start From Device';
  }

  // Check if timer has started
  hasTimerStarted(): boolean {
    return this.hasStarted;
  }
}
