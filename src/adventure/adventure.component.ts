import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { ActivePlayerSession } from "src/assets/active-player-session";
import { GameState } from "src/assets/game-state";
import { Player } from "src/assets/player";
import { Location } from "src/assets/location";
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import {MatCardModule} from '@angular/material/card';
import { GameSessionDisplay } from 'src/assets/game-session-display';

@Component({
    selector: 'adventure',
    templateUrl: './adventure.component.html',
    standalone: true,
    imports: [MatCardModule],
    styleUrl: './adventure.component.scss'
})
export class AdventureComponent implements OnInit {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;
    @Input() gameState: GameState = GameState.ROUND1;
    @Input() gameCode: string = "";
    @Input() activePlayerSession: ActivePlayerSession = new ActivePlayerSession();
    @Input() gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();

    locations: Location[] = [];
    players: Player[] = [];
    currentPlayerIndex: number = 0;
    currentTurnPlayer: Player | undefined = new Player();
    roundNumber: number = 0;
    settingNextPlayerTurn: boolean = false;
    favorEntity: string = "";

    constructor(private http:HttpClient) {}

    ngOnInit(): void {
      console.log("Adventure Loaded!" + this.activePlayerSession);
      this.getPlayers();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['activePlayerSession']) {
        setTimeout(() => this.scrollToBottom(), 0);

        if (
            this.activePlayerSession.playerId !== null
            && this.activePlayerSession.playerId !== ""
            && this.activePlayerSession.playerId !== this.currentTurnPlayer?.authorId
        ) {
          this.setCurrentPlayer();
        }
      }
    }

    private scrollToBottom(): void {
      try {
        if (this.scrollContainer !== undefined) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {
        console.error("Failed to scroll", err);
      }
    }
  
    setCurrentPlayer() {
      this.currentTurnPlayer = this.players.find(player => player.authorId === this.activePlayerSession.playerId);
      this.favorEntity = this.currentTurnPlayer?.playerStats.find(stat => stat.statType.favorType)?.statType.favorEntity ?? "";
    }

    getPlayers() {
      const params = {
        gameCode: this.gameCode
      };
  
      console.log(params);
  
      this.http
      .get<Player[]>(environment.nowhereBackendUrl + HttpConstants.PLAYER_PATH, { params })
        .subscribe({
          next: (response) => {
            console.log('Players retrieved!', response);
            this.players = response;
            this.setCurrentPlayer();
            console.log('Players:', this.players);
            console.log('Current Player:', this.currentTurnPlayer);
          },
          error: (error) => {
            console.error('Error getting players', error);
          },
        });
    }

  setExistingPlayerTurn(playerId: String) {
    this.currentPlayerIndex = this.players.findIndex((player) => player.authorId === playerId);
    this.currentTurnPlayer = this.players[this.currentPlayerIndex];
  }

  playerTurnMessage(): String {    
    switch(this.gameState) {
      case GameState.ROUND1:
      case GameState.ROUND2:
        if (!this.activePlayerSession.repercussions?.ending) {
          return `${this.currentTurnPlayer?.userName} is seeking adventure. Choose what you'll do from your phone.`;
        }

        return `${this.currentTurnPlayer?.userName} has made a discovery! Add new artifacts from your phone!`;
      case GameState.RITUAL:
        return `${this.currentTurnPlayer?.userName} is making their final choice. Choose what you'll do from your phone. Will you attempt to impress ${this.favorEntity} or will you do the unthinkable and try to oppose them?`;
      case GameState.ENDING:
        return `${this.currentTurnPlayer?.userName}'s fate is sealed`
      default:
        return "Look to your phone for answers!"
    } 
  }

  isRitualPhase() {
    return this.gameState === GameState.RITUAL;
  }
}