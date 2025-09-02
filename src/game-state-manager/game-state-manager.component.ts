import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GameService } from '../services/game-session.service';
import { GameState } from 'src/assets/game-state';
import { Location } from 'src/assets/location';
import { WritePromptComponent } from 'src/write-prompt/write-prompt.component';
import { AdventureComponent } from 'src/adventure/adventure.component';
import { ActivePlayerSession } from 'src/assets/active-player-session';
import { ActiveGameStateSession } from 'src/assets/active-game-state-session';
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
  gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();
  adventureMap: AdventureMap = new AdventureMap();
  currentLocation: Location = new Location();
  totalPointsTowardsVictory: number = 0;
  @Output() gameSessionCreated = new EventEmitter<boolean>();

  setNewGame(gameSessionCreated: boolean) {
    this.gameSessionCreated.emit(gameSessionCreated);
    this.gameState = GameState.INIT;
    this.activePlayerSession = new ActivePlayerSession();
    this.activeGameStateSession = new ActiveGameStateSession();
    this.didWeSucceed = false;
  }

  constructor(
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.populateGameSessionDisplay(this.gameCode);
    this.gameService.listenForGameStateChanges(this.gameCode)
      .subscribe((newState) => {
      this.gameState = newState.gameState as unknown as GameState;
      this.activePlayerSession = newState.activePlayerSession as unknown as ActivePlayerSession;

      const rawIsPlayerDone = newState.activeGameStateSession.isPlayerDone;
      this.activeGameStateSession = new ActiveGameStateSession();
      this.activeGameStateSession.isPlayerDone = new Map(Object.entries(rawIsPlayerDone));
      this.didWeSucceed = newState.didWeSucceed;
      this.totalPointsTowardsVictory = newState.totalPointsTowardsVictory ?? 0;
  
      console.log('New game state received:', this.gameState);
      console.log('New adventureMap:', this.adventureMap.locations);
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
    this.gameService.getGameSessionDisplay(gameCode)
      .subscribe({
        next: (response: any) => {
          console.log('Game session display retrieved from map!', response);
          
          this.gameSessionDisplay = response;
        },
        error: (error: any) => {
          console.error('Error creating game', error);
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