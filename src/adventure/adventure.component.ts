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
    playerTurnAuthorId: String = "";
    roundNumber: number = 0;

    constructor(private http:HttpClient) {}

    ngOnInit(): void {
      console.log("Adventure Loaded!" + this.activePlayerSession);
      this.getLocations(this.gameCode);
      this.getPlayers();
      this.setNextPlayerTurn();
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
              console.log('Stories retrieved!', response);
              this.locations = response;
              console.log('Locations', this.locations);
            },
            error: (error) => {
              console.error('Error creating game', error);
            },
          });
      }

      setNextPlayerTurn() {
        if(this.currentPlayerIndex >= this.players.length) {
          this.playerTurnAuthorId = this.players[this.currentPlayerIndex].authorId;
          this.currentPlayerIndex++;
          this.updateActivePlayerSession(new Story(), "", [], this.playerTurnAuthorId, false);
        } else {
          if(this.roundNumber <= 2) {
            this.roundNumber++;
            this.currentPlayerIndex = 0;
            this.setNextPlayerTurn();
          }
        }
      }

      getPlayers() {
        const params = {
          gameCode: this.gameCode
        };
    
        console.log(params);
    
        this.http
        .get<Player[]>(environment.production + HttpConstants.PLAYER_PATH, { params })
          .subscribe({
            next: (response) => {
              console.log('Players retrieved!', response);
              this.players = response;
              console.log('Players:', this.players);
            },
            error: (error) => {
              console.error('Error creating game', error);
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
}