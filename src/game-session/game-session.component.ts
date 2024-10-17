import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameSession } from 'src/assets/game-session';
import { GameState } from 'src/assets/game-state';
import { GameStateManagerComponent } from 'src/game-state-manager/game-state-manager.component';

@Component({
  selector: 'game-session',
  styles: `.btn { padding: 5px; }`,
  templateUrl: './game-session.component.html',
  standalone: true,
  imports: [GameStateManagerComponent]
})
export class GameSessionComponent {

  gameCode: string = '';
  gameSessionCreated: boolean = false;
  gameState: GameState = GameState.INIT;

  constructor(private http: HttpClient) {
    console.log('GameSessionComponent initialized');
    this.gameState = GameState.INIT;
  }

  ngOnInit() {
    console.log(this.gameSessionCreated);
  }

  createGame() {
    this.http
      .post<GameSession>('https://nowhere-556057816518.us-east5.run.app/game', {})
      .subscribe({
        next: (response) => {
          console.log('Game created!', response);
          
          this.gameCode = response.gameCode;  // assuming 'gameCode' is in the response
          this.gameSessionCreated = true;
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
      });
  }

  getPlayers(gameCode: string) {
    console.log('Your game code! ' + gameCode);
  }
}
