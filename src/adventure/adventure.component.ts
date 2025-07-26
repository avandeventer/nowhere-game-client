import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ActivePlayerSession } from "src/assets/active-player-session";
import { GameState } from "src/assets/game-state";
import { Player } from "src/assets/player";
import { Location } from "src/assets/location";
import { Story } from 'src/assets/story';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import {MatCardModule} from '@angular/material/card';

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

    locations: Location[] = [];
    players: Player[] = [];
    currentPlayerIndex: number = 0;
    playerName: String = "";
    playerTurnAuthorId: String = "";
    roundNumber: number = 0;
    settingNextPlayerTurn: boolean = false;

    constructor(private http:HttpClient) {}

    ngOnInit(): void {
      console.log("Adventure Loaded!" + this.activePlayerSession);
      this.getPlayers();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['activePlayerSession']) {
        setTimeout(() => this.scrollToBottom(), 0);
    
        if (changes['activePlayerSession'].currentValue?.setNextPlayerTurn && !this.settingNextPlayerTurn) {
          this.settingNextPlayerTurn = true;
          this.setNextPlayerTurn();
        }
      }
    }    

    private scrollToBottom(): void {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error("Failed to scroll", err);
      }
    }
  
    setNextPlayerTurn() {
      console.log("Set next player's turn");
      console.log("Player turn, round number", this.currentPlayerIndex, this.roundNumber);
      if(this.currentPlayerIndex < this.players.length) {
        this.playerTurnAuthorId = this.players[this.currentPlayerIndex].authorId;
        this.playerName = this.players[this.currentPlayerIndex].userName;
        this.currentPlayerIndex++;
        console.log("Player turn index, round number, author id", 
          this.currentPlayerIndex, 
          this.roundNumber, 
          this.playerTurnAuthorId);
        this.updateActivePlayerSession(new Story(), "", [], this.playerTurnAuthorId, false, "", []);
        this.settingNextPlayerTurn = false;
      } else {
        if(this.roundNumber <= 3) {
          this.roundNumber++;
          this.currentPlayerIndex = 0;
          this.setNextPlayerTurn();
        } else {
          this.roundNumber = 0;
        }
      }
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
            if (this.activePlayerSession.playerId === "") {
              this.setNextPlayerTurn();
            } else {
              this.setExistingPlayerTurn(this.activePlayerSession.playerId);
            }
            console.log('Players:', this.players);
          },
          error: (error) => {
            console.error('Error getting players', error);
          },
        });
    }

  setExistingPlayerTurn(playerId: String) {
    this.currentPlayerIndex = this.players.findIndex((player) => player.authorId === playerId);
    this.playerName = this.players[this.currentPlayerIndex].userName;
  }
      
  private updateActivePlayerSession(
    playerStory: Story,
    selectedOptionId: String,
    outcomeDisplay: String[],
    playerStoryId: String,
    setNextPlayerTurn: boolean,
    selectedLocationOptionId: String,
    locationOutcomeDisplay: String[]
  ) {
    console.log("Your player session", this.activePlayerSession);
    const newActivePlayerSession: ActivePlayerSession = new ActivePlayerSession();
    newActivePlayerSession.gameCode = this.gameCode;
    newActivePlayerSession.playerId = playerStoryId;
    newActivePlayerSession.story = playerStory;
    newActivePlayerSession.outcomeDisplay = outcomeDisplay;
    newActivePlayerSession.playerChoiceOptionId = selectedOptionId;
    newActivePlayerSession.setNextPlayerTurn = setNextPlayerTurn;
    newActivePlayerSession.selectedLocationOptionId = selectedLocationOptionId;
    newActivePlayerSession.locationOutcomeDisplay = locationOutcomeDisplay;
    console.log("New player session", newActivePlayerSession);

    this.activePlayerSession.playerId = playerStoryId;

    this.http
      .put<ActivePlayerSession>(environment.nowhereBackendUrl + HttpConstants.ACTIVE_PLAYER_SESSION_PATH, newActivePlayerSession)
      .subscribe({
        next: (response) => {
          console.log('Active player session updated!', response);
        },
        error: (error) => {
          console.error('Error updating session', error);
        },
      });
  }

  playerTurnMessage(): String {
    switch(this.gameState) {
      case GameState.ROUND1:
      case GameState.ROUND2:
        return `${this.playerName} is seeking adventure. Choose what you'll do from your phone.`;
      case GameState.RITUAL:
        return `${this.playerName} is making their final choice. Choose what you'll do from your phone.`;
      case GameState.ENDING:
        return `${this.playerName}'s fate is sealed`
      default:
        return "Look to your phone for answers!"

    } 
  }

  isRitualPhase() {
    return this.gameState === GameState.RITUAL;
  }
}