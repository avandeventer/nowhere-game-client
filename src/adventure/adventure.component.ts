import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ActivePlayerSession } from "src/assets/active-player-session";
import { GameState } from "src/assets/game-state";
import { Player } from "src/assets/player";
import { Location } from "src/assets/location";
import { Story } from 'src/assets/story';
import { Option } from 'src/assets/option';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';

@Component({
    selector: 'adventure',
    templateUrl: './adventure.component.html',
    standalone: true,
    imports: []
})
export class AdventureComponent implements OnInit {
    @Input() gameState: GameState = GameState.ROUND1;
    @Input() gameCode: string = "";
    @Input() activePlayerSession: ActivePlayerSession = new ActivePlayerSession();

    locations: Location[] = [];
    players: Player[] = [];
    currentPlayerIndex: number = 0;
    playerName: String = "";
    playerTurnAuthorId: String = "";
    roundNumber: number = 0;

    constructor(private http:HttpClient) {}

    ngOnInit(): void {
      console.log("Adventure Loaded!" + this.activePlayerSession);
      this.getLocations(this.gameCode);
      this.getPlayers();
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['activePlayerSession'] && changes['activePlayerSession'].currentValue?.setNextPlayerTurn) {
        this.setNextPlayerTurn();
      }
    }

    getLocations(gameCode: string) {
        const params = {
          gameCode: this.gameCode
        };
    
        console.log(params);
    
        this.http
        .get<Location[]>('https://nowhere-556057816518.us-east5.run.app/location', { params })
          .subscribe({
            next: (response) => {
              this.locations = response;
              console.log('Locations', this.locations);
            },
            error: (error) => {
              console.error('Error getting locations', error);
            },
          });
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
          this.updateActivePlayerSession(new Story(), "", [], this.playerTurnAuthorId, false);
        } else {
          if(this.roundNumber <= 2) {
            this.roundNumber++;
            this.currentPlayerIndex = 0;
            this.setNextPlayerTurn();
          } else {
            this.setToNextGamePhase();
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
              this.setNextPlayerTurn();
              console.log('Players:', this.players);
            },
            error: (error) => {
              console.error('Error getting players', error);
            },
          });
      }
      

  private updateActivePlayerSession(
    playerStory: Story,
    selectedOptionId: String,
    outcomeDisplay: String[],
    playerStoryId: String,
    setNextPlayerTurn: boolean
  ) {
    console.log("Your player session", this.activePlayerSession);
    const newActivePlayerSession: ActivePlayerSession = new ActivePlayerSession();
    newActivePlayerSession.gameCode = this.gameCode;
    newActivePlayerSession.playerId = playerStoryId;
    newActivePlayerSession.story = playerStory;
    newActivePlayerSession.outcomeDisplay = outcomeDisplay;
    newActivePlayerSession.playerChoiceOptionId = selectedOptionId;
    newActivePlayerSession.setNextPlayerTurn = setNextPlayerTurn;
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

  rollForSuccess(playerStat: number, dcToBeat: number): boolean {
    const diceRoll: number = Math.floor((Math.random() * 10) + 1);
    const playerTotal = diceRoll + playerStat;
    return playerTotal >= dcToBeat;
  }

  playerObject(): String {    
    if(this.players === null) {
      return "Player turns have not yet started";
    } 
    console.log("Player set: ", this.currentPlayerIndex);
    console.log("Your player", this.players[this.currentPlayerIndex]);
    return this.players[this.currentPlayerIndex].userName + " is seeking boons for the harvest. Check your hand portal to get started.";
  }

  setToNextGamePhase() {
    let nextGamePhase: GameState = GameState.INIT;

    switch(this.gameState) { 
      case GameState.ROUND1: { 
        nextGamePhase = GameState.START_PHASE2;
        break; 
      } 
      case GameState.ROUND2: { 
        nextGamePhase = GameState.WRITE_ENDINGS;
        break; 
      }
      default: { 
        break; 
      } 
    }

    this.gameState = nextGamePhase;

    const requestBody = {
      gameCode: this.gameCode,
      gameState: nextGamePhase,
    };

    console.log(requestBody);

    this.http
      .put('https://nowhere-556057816518.us-east5.run.app/game', requestBody)
      .subscribe({
        next: (response) => {
          console.log('Next game phase triggered', nextGamePhase);
        },
        error: (error) => {
          console.error('Error started game', error);
        },
      });
  }
}