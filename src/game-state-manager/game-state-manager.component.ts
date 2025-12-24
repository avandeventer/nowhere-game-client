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
import { WinState } from 'src/assets/win-state';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdventureMap } from 'src/assets/adventure-map';
import { StatType } from 'src/assets/stat-type';
import { QrCodeComponent } from 'ng-qrcode';
import { MusicService } from 'src/services/music.service';
import { TimerService } from 'src/services/timer.service';
import { TimerComponent } from 'src/timer/timer.component';
import { PlayerProgressComponent } from 'src/player-progress/player-progress.component';
import { CollaborativeTextComponent } from 'src/collaborative-text/collaborative-text.component';
import { CollaborativeMode, CollaborativeTextPhaseInfo, PhaseType } from 'src/assets/collaborative-text-phase-info';
import { GameBoard } from 'src/assets/game-board';

@Component({
    selector: 'game-state-manager',
    templateUrl: './game-state-manager.component.html',
    styleUrl: './game-state-manager.style.scss',
    imports: [WritePromptComponent, AdventureComponent, LocationComponent, FinaleComponent, MatCardModule, MatButtonModule, MatIconModule, QrCodeComponent, TimerComponent, PlayerProgressComponent, CollaborativeTextComponent]
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
  favorStat: StatType = new StatType();
  qrCodeUrl: string = '';
  winState: WinState = new WinState();
  collaborativeTextPhaseInfo: CollaborativeTextPhaseInfo | null = null;
  gameBoard: GameBoard | null = null;
  @Output() gameSessionCreated = new EventEmitter<boolean>();
  
  // Music toggle properties
  isMusicEnabled: boolean = true;
  private currentMusicTrack: string = '';
  
  // Timer properties
  private previousGameState: GameState = GameState.INIT;
  
  setNewGame(gameSessionCreated: boolean) {
    this.gameSessionCreated.emit(gameSessionCreated);
    this.gameState = GameState.INIT;
    this.activePlayerSession = new ActivePlayerSession();
    this.activeGameStateSession = new ActiveGameStateSession();
    this.didWeSucceed = false;
  }

  constructor(
    private gameService: GameService,
    private musicService: MusicService,
    private timerService: TimerService
  ) {}

  ngOnInit() {
    this.populateGameSessionDisplay(this.gameCode);
    this.setupBackgroundMusic();
    this.qrCodeUrl = `https://nowhere-player-client-556057816518.us-east4.run.app/game/${this.gameCode}`;
    // Load initial phase info
    this.loadCollaborativeTextPhaseInfo();
    this.gameService.listenForGameStateChanges(this.gameCode)
      .subscribe((newState) => {
      const previousGameState = this.gameState;
      this.gameState = newState.gameState as unknown as GameState;
      this.activePlayerSession = newState.activePlayerSession as unknown as ActivePlayerSession;

      const rawIsPlayerDone = newState.activeGameStateSession.isPlayerDone;
      this.activeGameStateSession = new ActiveGameStateSession();
      this.activeGameStateSession.isPlayerDone = new Map(Object.entries(rawIsPlayerDone));
      this.didWeSucceed = newState.didWeSucceed;
      this.totalPointsTowardsVictory = newState.totalPointsTowardsVictory ?? 0;
      this.adventureMap = newState.adventureMap as unknown as AdventureMap;
      this.gameBoard = newState.gameBoard as unknown as GameBoard;
      this.favorStat = this.adventureMap !== null 
          && this.adventureMap.statTypes !== null 
          && this.adventureMap.statTypes.find(stat => stat.favorType) !== undefined 
          ? this.adventureMap.statTypes.find(stat => stat.favorType) as StatType 
          : new StatType();
  
      console.log('New game state received:', this.gameState);
      console.log('New adventureMap:', this.adventureMap);
      
      // Check if game state changed and reset timer if needed
      if (previousGameState !== this.gameState) {
        this.previousGameState = previousGameState;
        console.log('Game state changed from', previousGameState, 'to', this.gameState);
        // Timer will automatically reset when the component re-renders with new duration
        // Load phase info when game state changes
        this.loadCollaborativeTextPhaseInfo();
      }
      
      // Load victory state when entering write endings phase
      if (this.isGameInWriteEndingsPhase() && previousGameState !== this.gameState) {
        this.loadVictoryState();
      }
      
      this.updateBackgroundMusic();
      
      // Subscribe to music state
      this.musicService.isMusicEnabled$.subscribe(enabled => {
        this.isMusicEnabled = enabled;
      });
      });
  }

  public loadCollaborativeTextPhaseInfo() {
    if (!this.gameCode) return;
    
    this.gameService.getCollaborativeTextPhaseInfo(this.gameCode).subscribe({
      next: (phaseInfo: CollaborativeTextPhaseInfo) => {
        this.collaborativeTextPhaseInfo = phaseInfo;
      },
      error: (error) => {
        console.error('Error loading collaborative text phase info:', error);
        this.collaborativeTextPhaseInfo = null;
      }
    });
  }

  setCurrentLocation() {
    let foundLocation = this.adventureMap.locations.find(
      location => location.id === this.activePlayerSession?.story?.location?.id
    ) ?? new Location();

    this.currentLocation = foundLocation;
    console.log('Current location updated: ', this.currentLocation);
  }

  getInstructionDisplay() {
    switch (this.gameState) {
      case GameState.PREAMBLE:
        return `You are about to embark on a journey into the unknown. You'll each choose where you'll spend your time and then your friends will determine what happens to you there. 
        Be wary that some of you will encounter the entity who holds the most power in this world, ${this.favorStat.favorEntity}, which means that the rest of you will need to describe what makes them who they are.`;
      case GameState.PREAMBLE_AGAIN:
        return `The final challenge draws closer. The world is stranger because of the choices you've made so far and some of the things you see this round will build on what you saw in the last round. Be prepared to write
        sequel encounters that connected to a specific players or to specific locations!`;
      case GameState.ENDING_PREAMBLE:
        return `The final challenge begins. You will each encounter ${this.favorStat.favorEntity} and your choices will determine the fate of everyone in ${this.adventureMap.name}. Luckily, we have learned a lot about ${this.favorStat.favorEntity} by now! All that's left is to decide whether you want to impress them or defy them.`;
      default:
        return this.gameSessionDisplay.mapDescription;
    }
  }

  getGameSessionDisplay() {
    switch (this.gameState) {
      case GameState.PREAMBLE:
        return this.gameSessionDisplay.mapDescription;
      case GameState.PREAMBLE_AGAIN:
        return this.gameSessionDisplay.playerDescription;
      case GameState.ENDING_PREAMBLE:
        return this.gameSessionDisplay.goalDescription + this.gameSessionDisplay.endingDescription;
      default:
        return this.gameSessionDisplay.mapDescription;
    }
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

  isGameInPreamblePhase() {
    return this.gameState === GameState.PREAMBLE || this.gameState === GameState.PREAMBLE_AGAIN || this.gameState === GameState.ENDING_PREAMBLE;
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

  isGameInCollaborativeTextPhase() {
    // Check if we're in any collaborative text phase (submission, voting, or winning)
    return (this.collaborativeTextPhaseInfo?.phaseType === PhaseType.SUBMISSION ||
           this.collaborativeTextPhaseInfo?.phaseType === PhaseType.VOTING ||
           this.collaborativeTextPhaseInfo?.phaseType === PhaseType.WINNING ||
           this.gameState === GameState.WRITE_ENDING_TEXT) && this.gameState !== GameState.INIT && this.gameState !== GameState.PREAMBLE;
  }

  isGameInFearQuestions() {
    return this.gameState === GameState.WHAT_DO_WE_FEAR || this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE || this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE_WINNER
    || this.gameState === GameState.WHAT_IS_COMING || this.gameState === GameState.WHAT_IS_COMING_VOTE || this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER;
  }

  isGameInCollaborativeTextWritingPhase() {
    return this.collaborativeTextPhaseInfo?.phaseType === PhaseType.SUBMISSION ||
           this.gameState === GameState.WRITE_ENDING_TEXT;
  }

  isGameInLocationCreationPhase() {
    return this.gameState === GameState.WHERE_CAN_WE_GO || this.gameState === GameState.WHAT_OCCUPATIONS_ARE_THERE;
  }

  isGameInWriteEndingTextPhase() {
    return this.gameState === GameState.WRITE_ENDING_TEXT;
  }

  getTimerDuration(): number {
    if (this.gameState === GameState.WHAT_DO_WE_FEAR || this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF) {
      return 90;
    }
    if (this.isGameInWritingPhase() || this.isGameInLocationCreationPhase() || this.isGameInWriteEndingsPhase()) {
      return 180; // 3 minutes for writing, location creation, and ending text phases
    } else if (this.isGameInCollaborativeTextWritingPhase()) {
      if (this.collaborativeTextPhaseInfo?.collaborativeMode === CollaborativeMode.RAPID_FIRE) {
        return 90;
      }
    }
    return 120;
  }

  toggleMusic(): void {
    this.musicService.toggleMusic();
  }

  private setupBackgroundMusic() {
    this.updateBackgroundMusic();
  }

  private updateBackgroundMusic() {
    const track = this.getMusicTrackForGameState();
    if (track && track !== this.currentMusicTrack) {
      this.musicService.playMusicTrack(track);
      this.currentMusicTrack = track;
    }
  }

  private getMusicTrackForGameState(): string {
    // Play epilogue music for SUCCESS or DESTROYED states
    if (this.winState && (this.winState.state === 'SUCCESS' || this.winState.state === 'DESTROYED')) {
      return 'Nowhere_Epilogue_Loop_V1.wav';
    }
    
    if (this.isGameInitialized() || this.isGameInLocationSelectPhase() || this.gameState === GameState.ROUND1) {
      return 'JustTryYourBest_NoTension.wav';
    }
    
    if (this.isGameInWritingPhase() 
      || this.isGameInWriteEndingsPhase() 
      || (this.isGameInCollaborativeTextPhase() && !this.isGameInFearQuestions())
      || this.isGameInLocationCreationPhase()) {
      return 'FolkSoundscape_1.wav';
    }
    if (this.isGameInRitualPhase() || this.isGameInFearQuestions()) {
      return 'Ritual_TestLoop.wav';
    }
    if (this.gameState === GameState.ROUND2 || this.isGameInEndingPhase() || this.isGameInFinalePhase()) {
      return 'JustTryYourBest_TensionTail_BanjoTag.wav';
    }
    return '';
  }

  private loadVictoryState() {
    this.gameService.getVictory(this.gameCode)
      .subscribe({
        next: (winState: WinState) => {
          console.log('Victory state loaded:', winState);
          this.winState = winState;
          // Update music after loading victory state
          this.updateBackgroundMusic();
        },
        error: (error: any) => {
          console.error('Error loading victory state', error);
        }
      });
  }

  /**
   * Handles timer completion for all game phases
   */
  onTimerComplete() {
    console.log(`Timer completed for game phase: ${this.gameState}, advancing to next phase...`);
    
    // For write phases, set writeTimerDone instead of advancing
    if (this.isGameInWritingPhase() || this.isGameInLocationCreationPhase() || this.isGameInWriteEndingsPhase()) {
      this.timerService.setWriteTimerDone(this.gameCode).subscribe({
        next: (response) => {
          console.log('writeTimerDone set successfully', response);
        },
        error: (error) => {
          console.error('Error setting writeTimerDone:', error);
        }
      });
    } else {
      // For other phases, advance to next phase
      this.timerService.onTimerComplete(this.gameCode).subscribe({
        next: (response) => {
          console.log('Game phase advanced successfully', response);
        },
        error: (error) => {
          console.error('Error advancing game phase:', error);
        }
      });
    }
  }
}