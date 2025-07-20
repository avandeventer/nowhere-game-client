import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GameService } from '../services/game-session.service';
import { HttpClient } from '@angular/common/http';
import { GameState } from 'src/assets/game-state';
import { Location } from 'src/assets/location';
import { WritePromptComponent } from 'src/write-prompt/write-prompt.component';
import { AdventureComponent } from 'src/adventure/adventure.component';
import { ActivePlayerSession } from 'src/assets/active-player-session';
import { ActiveGameStateSession } from 'src/assets/active-game-state-session';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LocationComponent } from 'src/location/location.component';
import { FinaleComponent } from 'src/finale/finale.component';
import { GameSessionDisplay } from 'src/assets/game-session-display';
import { MatCardModule } from '@angular/material/card';
import { AdventureMap } from 'src/assets/adventure-map';

@Component({
  selector: 'game-state-manager',
  templateUrl: './game-state-manager.component.html',
  styleUrl: './game-state-manager.style.scss',
  standalone: true,
  imports: [WritePromptComponent, AdventureComponent, LocationComponent, FinaleComponent, MatCardModule]
})
export class GameStateManagerComponent implements OnInit {
  @Input() gameCode: string = "";
  gameState: GameState = GameState.INIT;
  activePlayerSession: ActivePlayerSession = new ActivePlayerSession();
  activeGameStateSession: ActiveGameStateSession = new ActiveGameStateSession();
  didWeSucceed: boolean = false;
  isSettingNextGameState: boolean = false;
  gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();
  adventureMap: AdventureMap = new AdventureMap();
  currentLocation: Location = new Location();
  @Output() gameSessionCreated = new EventEmitter<boolean>();

  setNewGame(gameSessionCreated: boolean) {
    this.gameSessionCreated.emit(gameSessionCreated);
    this.gameState = GameState.INIT;
    this.activePlayerSession = new ActivePlayerSession();
    this.activeGameStateSession = new ActiveGameStateSession();
    this.didWeSucceed = false;
    this.isSettingNextGameState = false;  
  }

  constructor(
    private gameService: GameService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.populateGameSessionDisplay(this.gameCode);
    this.gameService.listenForGameStateChanges(this.gameCode)
      .pipe(debounceTime(300), distinctUntilChanged((a, b) => a.activeGameStateSession === b.activeGameStateSession))
      .subscribe((newState) => {
      this.gameState = newState.gameState as unknown as GameState;
      this.activePlayerSession = newState.activePlayerSession as unknown as ActivePlayerSession;

      const rawIsPlayerDone = newState.activeGameStateSession.isPlayerDone;
      this.activeGameStateSession = new ActiveGameStateSession();
      this.activeGameStateSession.isPlayerDone = new Map(Object.entries(rawIsPlayerDone));
      this.didWeSucceed = newState.didWeSucceed;
  
      console.log('New adventureMap:', this.adventureMap.locations);

      this.checkForNextGameState(this.activeGameStateSession);
    });
  }

  setCurrentLocation() {
    let foundLocation = this.adventureMap.locations.find(
      location => location.id === this.activePlayerSession?.story?.location?.id
    ) ?? new Location();

    this.currentLocation = foundLocation;
    console.log('Current location updated: ', this.currentLocation);
  }

  populateGameSessionDisplay(gameCode: string) {
    const parameter = "?gameCode=" + gameCode;

    this.http
      .get<GameSessionDisplay>(environment.nowhereBackendUrl + HttpConstants.DISPLAY_PATH + parameter)
      .subscribe({
        next: (response) => {
          console.log('Game session display retrieved from map!', response);
          
          this.gameSessionDisplay = response;
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
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

  isGameInLocationSelectPhase() {
    return this.gameState === GameState.LOCATION_SELECT
    || this.gameState === GameState.LOCATION_SELECT_AGAIN
  }

  isGameInWritingPhase() {
    return this.gameState === GameState.WRITE_PROMPTS 
    || this.gameState === GameState.WRITE_OPTIONS 
    || this.gameState === GameState.WRITE_PROMPTS_AGAIN 
    || this.gameState === GameState.WRITE_OPTIONS_AGAIN;
  }

  isGameInSecondPhase() {
    return this.gameState === GameState.WRITE_PROMPTS_AGAIN;
  }

  isGameInWriteEndingsPhase() {
    return this.gameState === GameState.WRITE_ENDINGS;
  }

  isGameInAdventurePhase() {
    return this.gameState === GameState.ROUND1
      || this.gameState === GameState.ROUND2;
  }

  isGameInRitualPhase() {
    return this.gameState === GameState.RITUAL;
  }

  isGameInEndingPhase() {
    return this.gameState === GameState.ENDING;
  }

  isGameInFinalePhase() {
    return this.gameState === GameState.FINALE;
  }
}