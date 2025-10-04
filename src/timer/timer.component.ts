import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() duration: number = 90; // Duration in seconds
  @Input() label: string = 'Time Remaining';
  @Input() autoStart: boolean = true;
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timerTick = new EventEmitter<number>();

  currentCountdown: number = 0;
  private timerSubscription?: Subscription;

  ngOnInit() {
    if (this.autoStart) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer(); // Stop any existing timer

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
}
