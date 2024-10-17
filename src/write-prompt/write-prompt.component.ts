import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { GameState } from 'src/assets/game-state';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'write-prompt',
  templateUrl: './write-prompt.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class WritePromptComponent implements OnInit {
  @Input() gameState: GameState = GameState.WRITE_PROMPTS;
  @Input() gameCode: string = "";
  countDownTime: Observable<number>;


  constructor(private http: HttpClient) {
    
    this.countDownTime = timer(0, 1000).pipe(
        map(n => 300 - n),
        takeWhile(n => n >= 0),
    );
  }

  ngOnInit() {
  }
}
