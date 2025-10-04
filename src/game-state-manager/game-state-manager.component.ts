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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdventureMap } from 'src/assets/adventure-map';
import { StatType } from 'src/assets/stat-type';
import { QrCodeComponent } from 'ng-qrcode';
import { MusicService } from 'src/services/music.service';
import { TimerService } from 'src/services/timer.service';
import { TimerComponent } from 'src/timer/timer.component';
import { PlayerProgressComponent } from 'src/player-progress/player-progress.component';

@Component({
    selector: 'game-state-manager',
    templateUrl: './game-state-manager.component.html',
    styleUrl: './game-state-manager.style.scss',
    imports: [WritePromptComponent, AdventureComponent, LocationComponent, FinaleComponent, MatCardModule, MatButtonModule, MatIconModule, QrCodeComponent, TimerComponent, PlayerProgressComponent]
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
  @Output() gameSessionCreated = new EventEmitter<boolean>();
  
  // Music toggle properties
  isMusicEnabled: boolean = true;
  private currentMusicTrack: string = '';
  
  // Animation properties
  showCollaborativeText: boolean = false;

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
      this.favorStat = this.adventureMap.statTypes.find(stat => stat.favorType) ?? new StatType();
  
      console.log('New game state received:', this.gameState);
      console.log('New adventureMap:', this.adventureMap);
      
      // Trigger collaborative text animation when entering collaborative phases
      if (this.isGameInCollaborativeTextPhase() && !this.isGameInCollaborativeTextPhaseForState(previousGameState)) {
        this.showCollaborativeText = true;
        // Reset animation after it completes
        setTimeout(() => {
          this.showCollaborativeText = false;
        }, 2000);
      }
      
      this.updateBackgroundMusic();
      
      // Subscribe to music state
      this.musicService.isMusicEnabled$.subscribe(enabled => {
        this.isMusicEnabled = enabled;
      });
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
        return this.gameSessionDisplay.goalDescription;
      case GameState.ENDING_PREAMBLE:
        return this.gameSessionDisplay.endingDescription;
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
    return this.gameState === GameState.WHERE_ARE_WE || 
           this.gameState === GameState.WHO_ARE_WE || 
           this.gameState === GameState.WHAT_IS_OUR_GOAL || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF|| 
           this.gameState === GameState.WHERE_ARE_WE_VOTE || 
           this.gameState === GameState.WHO_ARE_WE_VOTE || 
           this.gameState === GameState.WHAT_IS_OUR_GOAL_VOTE || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE;
  }

  getCollaborativeTextQuestion() {
    switch (this.gameState) {
      case GameState.WHERE_ARE_WE:
      case GameState.WHERE_ARE_WE_VOTE:
        return 'Where are we?';
      case GameState.WHO_ARE_WE:
      case GameState.WHO_ARE_WE_VOTE:
        return 'Who are we?';
      case GameState.WHAT_IS_OUR_GOAL:
      case GameState.WHAT_IS_OUR_GOAL_VOTE:
        return 'What is our goal?';
      case GameState.WHAT_ARE_WE_CAPABLE_OF:
      case GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE:
        return 'What are we capable of?';
      default:
        return 'Collaborative Writing';
    }
  }

  private isGameInCollaborativeTextPhaseForState(gameState: GameState) {
    return gameState === GameState.WHERE_ARE_WE || 
           gameState === GameState.WHO_ARE_WE || 
           gameState === GameState.WHAT_IS_OUR_GOAL || 
           gameState === GameState.WHAT_ARE_WE_CAPABLE_OF || 
           gameState === GameState.WHERE_ARE_WE_VOTE || 
           gameState === GameState.WHO_ARE_WE_VOTE || 
           gameState === GameState.WHAT_IS_OUR_GOAL_VOTE || 
           gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE;
  }

  getCollaborativeTextVotingInstruction() {
    return 'The time has come to solidify our fate. Rank the descriptions on your device from best to worst.';
  }

  getCollaborativeTextInstruction() {
    let collaborativeTextInstruction = '';

    switch (this.gameState) {
      case GameState.WHERE_ARE_WE:
        collaborativeTextInstruction = 'We will begin by describing our world.';
        break;
      case GameState.WHO_ARE_WE:
        collaborativeTextInstruction = 'Now a potentially even more crucial question. Define who we are together. What is our goal?';
        break;
      case GameState.WHAT_IS_OUR_GOAL:
        collaborativeTextInstruction = 'Something is coming. What must we each do when it arrives to ensure our survival?';
        break;
      case GameState.WHAT_ARE_WE_CAPABLE_OF:
        collaborativeTextInstruction = 'We will need certain skills in order to overcome. List anything you thing we will need to be good at to survive. Some of you may need to answer a question of a slightly different nature.';
        break;
      default:
        return 'Do your best to answer the question above!';
    }


    return collaborativeTextInstruction + ' Look to your device and don\'t worry about thinking too hard about what you say. Your friends will help!';
  }

  isGameInCollaborativeTextVotingPhase() {
    return this.gameState === GameState.WHERE_ARE_WE_VOTE || 
           this.gameState === GameState.WHO_ARE_WE_VOTE || 
           this.gameState === GameState.WHAT_IS_OUR_GOAL_VOTE || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE;
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
    if (this.isGameInitialized() || this.isGameInLocationSelectPhase() || this.gameState === GameState.ROUND1) {
      return 'JustTryYourBest_NoTension.wav';
    }
    if (this.isGameInWritingPhase() || this.isGameInWriteEndingsPhase()) {
      return 'FolkSoundscape_1.wav';
    }
    if (this.gameState === GameState.ROUND2 || this.isGameInRitualPhase() || this.isGameInEndingPhase() || this.isGameInFinalePhase()) {
      return 'JustTryYourBest_TensionTail_BanjoTag.wav';
    }
    return '';
  }

  /**
   * Handles timer completion for collaborative text phases
   */
  onCollaborativeTextTimerComplete() {
    console.log('Collaborative text timer completed, advancing to next game phase...');
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