import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameSession } from 'src/assets/game-session';
import { GameState } from 'src/assets/game-state';
import { GameStateManagerComponent } from 'src/game-state-manager/game-state-manager.component';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'game-session',
  styles: `.btn { padding: 5px; }`,
  templateUrl: './game-session.component.html',
  standalone: true,
  imports: [GameStateManagerComponent, ReactiveFormsModule]
})
export class GameSessionComponent {

  gameCode: string = '';
  gameSessionCreated: boolean = false;
  gameState: GameState = GameState.INIT;
  rejoinCode = new FormControl('');

  constructor(private http: HttpClient) {
    console.log('GameSessionComponent initialized');
    this.gameState = GameState.INIT;
  }

  ngOnInit() {
    console.log(this.gameSessionCreated);
  }

  initializeGame() {
    if(this.rejoinCode.value != "") {
      this.rejoinGame();
    } else {
      this.createGame();
    }
  }

  createGame() {
    this.http
      .post<GameSession>(environment.nowhereBackendUrl + HttpConstants.GAME_SESSION_PATH, {})
      .subscribe({
        next: (response) => {
          console.log('Game created!', response);
          
          this.gameCode = response.gameCode;
          this.gameSessionCreated = true;
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
      });
  }

  rejoinGame() {
    const params = {
      gameCode: this.rejoinCode.value ?? ''
    };

    this.http
      .get<GameSession>(environment.nowhereBackendUrl + HttpConstants.GAME_SESSION_PATH, { params })
      .subscribe({
        next: (response) => {
          console.log('Game rejoined!', response);
          this.gameCode = response.gameCode;
          this.gameSessionCreated = true;
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
      });
  }

}
