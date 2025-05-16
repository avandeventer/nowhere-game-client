import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameSession } from 'src/assets/game-session';
import { GameState } from 'src/assets/game-state';
import { GameStateManagerComponent } from 'src/game-state-manager/game-state-manager.component';
import { environment } from 'src/environments/environments';
import { HttpConstants } from 'src/assets/http-constants';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile } from 'src/assets/user-profile';
import { ProfileAdventureMap } from 'src/assets/profile-adventure-map';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { SaveGame } from 'src/assets/save-game';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'game-session',
  styles: `.btn { padding: 5px; }`,
  templateUrl: './game-session.component.html',
  standalone: true,
  imports: [GameStateManagerComponent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CdkAccordionModule, MatExpansionModule, MatListModule]
})
export class GameSessionComponent {
  @Input() userProfile = new UserProfile();
  gameCode: string = '';
  gameSessionCreated: boolean = false;
  gameState: GameState = GameState.INIT;
  rejoinCode = new FormControl('');
  adventureId: string = "";
  saveGameId: string = "";

  constructor(private http: HttpClient) {
    console.log('GameSessionComponent initialized');
    this.gameState = GameState.INIT;
  }

  ngOnInit() {
    const firstMapEntry = this.adventureMapsList[0];
    if (firstMapEntry) {
      const saveGames = this.getSaveGamesList(firstMapEntry.map);
      if (saveGames.length > 0) {
        this.adventureId = firstMapEntry.map.adventureMap.adventureId;
        this.saveGameId = saveGames[0].saveGame.id;
      }
    }
  }

  initializeGame() {
    if(this.rejoinCode.value != "") {
      this.rejoinGame();
    } else {
      this.createGame();
    }
  }

  get adventureMapsList(): { key: string, map: ProfileAdventureMap }[] {
    return Object.entries(this.userProfile.maps).map(([key, map]) => ({ key, map }));
  }

  getSaveGamesList(map: ProfileAdventureMap): { key: string, saveGame: SaveGame }[] {
    const list = Object.entries(map.saveGames).map(([key, saveGame]) => ({ key, saveGame }));
    console.log("Your save games:");
    console.log(list);
    return list;
  }


selectSaveGame(adventureId: string, saveGameId: string) {
  this.adventureId = adventureId;
  this.saveGameId = saveGameId;

  // Optional: Scroll to the selected item
  setTimeout(() => {
    const el = document.getElementById(`save-game-${saveGameId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 0);
}
    
  createGame() {
    const createGameParameters = "?userProfileId=" + this.userProfile.id + "&adventureId=" + this.adventureId + "&saveGameId=" + this.saveGameId;

    this.http
      .post<GameSession>(environment.nowhereBackendUrl + HttpConstants.GAME_SESSION_PATH + createGameParameters, {})
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
