import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { GameState } from 'src/assets/game-state';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription, map, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'write-prompt',
  templateUrl: './write-prompt.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class WritePromptComponent implements OnInit {
  @Input() gameState: GameState = GameState.WRITE_PROMPTS;
  @Input() gameCode: string = "";
  private timerSubscription: Subscription = new Subscription;
  countDownTime: Observable<number> = new Observable;
  currentCountdown: number = 0;
  timerStartValue: number = 90;

  startTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.countDownTime = timer(0, 1000).pipe(
      map(n => this.timerStartValue - n),
      takeWhile(n => n >= 0),
    );

    this.timerSubscription = this.countDownTime.subscribe(time => {
      this.currentCountdown = time;
      if(this.currentCountdown == 0) {
        this.setToNextGamePhase();
        this.resetTimer();
      }
    });
  }

  resetTimer() {
    this.startTimer();
  }

  constructor(private http: HttpClient) {
    this.startTimer();
  }

  ngOnInit() {
  }

  setToNextGamePhase() {

    let nextGamePhase: GameState = GameState.INIT;

    switch(this.gameState) { 
      case GameState.WRITE_PROMPTS: { 
         nextGamePhase = GameState.WRITE_OPTIONS;
         break; 
      } 
      case GameState.WRITE_OPTIONS: { 
         nextGamePhase = GameState.ROUND1;
         break; 
      } 
      default: { 
         nextGamePhase = GameState.INIT
         break; 
      } 
   } 

    const requestBody = {
      gameCode: this.gameCode,
      gameState: nextGamePhase,
    };

    console.log(requestBody);

    this.http
      .put('https://nowhere-556057816518.us-east5.run.app/game', requestBody)
      .subscribe({
        next: (response) => {
          console.log('Time to write options!', response);
        },
        error: (error) => {
          console.error('Error started game', error);
        },
      });
    
    
  }
  
}