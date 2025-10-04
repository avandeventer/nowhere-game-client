import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { GameState } from 'src/assets/game-state';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';

@Component({
    selector: 'write-prompt',
    templateUrl: './write-prompt.component.html',
    imports: [ReactiveFormsModule]
})
export class WritePromptComponent implements OnInit {
  @Input() gameState: GameState = GameState.WRITE_PROMPTS;
  @Input() gameCode: string = "";

  constructor(private http: HttpClient) {}

  ngOnInit() {}
}