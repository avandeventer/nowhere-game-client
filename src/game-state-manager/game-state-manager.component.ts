import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { GameService } from '../services/game-session.service';
import { HttpClient } from '@angular/common/http';
import { GameState } from 'src/assets/game-state';
import { WritePromptComponent } from 'src/write-prompt/write-prompt.component';
import { AdventureComponent } from 'src/adventure/adventure.component';
import { ActivePlayerSession } from 'src/assets/active-player-session';
import { ActiveGameStateSession } from 'src/assets/active-game-state-session';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'game-state-manager',
  templateUrl: './game-state-manager.component.html',
  standalone: true,
  imports: [WritePromptComponent, AdventureComponent]
})
export class GameStateManagerComponent implements OnInit {
  @Input() gameCode: string = "";
  gameState: GameState = GameState.INIT;
  activePlayerSession: ActivePlayerSession = new ActivePlayerSession();
  activeGameStateSession: ActiveGameStateSession = new ActiveGameStateSession();
  isSettingNextGameState: boolean = false;

  constructor(
    private gameService: GameService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.gameService.listenForGameStateChanges(this.gameCode).pipe(debounceTime(300)).subscribe((newState) => {
      this.gameState = newState.gameState as unknown as GameState;
      this.activePlayerSession = newState.activePlayerSession as unknown as ActivePlayerSession;

      const rawIsPlayerDone = newState.activeGameStateSession.isPlayerDone;
      this.activeGameStateSession = new ActiveGameStateSession();
      this.activeGameStateSession.isPlayerDone = new Map(Object.entries(rawIsPlayerDone));
  
      console.log('New gameState:', this.gameState);
      console.log('New Active Player Session', this.activePlayerSession);
      console.log('New Active Game State Session', this.activeGameStateSession);

      this.checkForNextGameState(this.activeGameStateSession);
    });
  }

  checkForNextGameState(activeGameStateSession: ActiveGameStateSession) {
    if (!this.isSettingNextGameState && activeGameStateSession.isPlayerDone.size !== 0) {
      const allPlayersDone = Array.from(activeGameStateSession.isPlayerDone.values()).every(value => value);
  
      if (allPlayersDone) {
        console.log('All players are done', activeGameStateSession);
        this.isSettingNextGameState = true;
        this.setToNextGameState();
      }
    }
  }
  
  setToNextGameState() {
    this.http
      .put(environment.nowhereBackendUrl + HttpConstants.NEXT_GAME_SESSION_PATH + '?gameCode=' + this.gameCode, {})
      .subscribe({
        next: (response) => {
          this.isSettingNextGameState = false;
          console.log('Game phase updated', response);
        },
        error: (error) => {
          console.error('Error updating game phase', error);
        },
      });
  }

  isGameInitialized() {
    return this.gameState === GameState.INIT;
  }

  isGameStarted() {
    return this.gameState === GameState.WRITE_PROMPTS 
    || this.gameState === GameState.WRITE_OPTIONS 
    || this.gameState === GameState.WRITE_PROMPTS_AGAIN 
    || this.gameState === GameState.WRITE_OPTIONS_AGAIN;
  }

  isGameInAdventurePhase() {
    return this.gameState === GameState.ROUND1 || this.gameState === GameState.ROUND2;
  }
}