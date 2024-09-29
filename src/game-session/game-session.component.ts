import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameSession } from 'src/assets/game-session';
import { Player } from 'src/assets/player';
import { GameState } from 'src/assets/game-state';

@Component({
  selector: 'game-session',
  styles: `.btn { padding: 5px; }`,
  templateUrl: './game-session.component.html',
  standalone: true,
})
export class GameSessionComponent {

  // player: Player[] = new List();
  gameCode: string = '';
  gameSessionCreated: boolean = false;
  gameState: GameState = GameState.init;

  constructor(private http: HttpClient) {
    console.log('GameSessionComponent initialized');
    this.gameState = GameState.init;
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
    // this.player.name = playerName;
    console.log('Your game code! ' + gameCode);
  }
}
