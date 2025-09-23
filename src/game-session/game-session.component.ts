import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { SaveGame } from 'src/assets/save-game';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdventureMapFormComponent } from 'src/adventure-map-form/adventure-map-form.component';
import { AdventureMap } from 'src/assets/adventure-map';
import { MatChip } from '@angular/material/chips';
import { QrCodeModule } from 'ng-qrcode';

@Component({
    selector: 'game-session',
    styleUrl: './game-session.component.scss',
    templateUrl: './game-session.component.html',
    imports: [GameStateManagerComponent, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CdkAccordionModule, MatExpansionModule, MatListModule, MatIconModule, MatCheckboxModule, AdventureMapFormComponent, MatChip, QrCodeModule]
})
export class GameSessionComponent {
  @Input() userProfile = new UserProfile();
  gameCode: string = '';
  qrCodeUrl: string = '';
  gameSessionCreated: boolean = false;
  @Output() startGame = new EventEmitter<boolean>();
  @Output() refreshLogin = new EventEmitter<string>();
  gameState: GameState = GameState.INIT;
  rejoinCode = new FormControl('');
  adventureId: string = "";
  saveGameId: string = "";
  activatedSaveGameId: string = 'none';
  saveGameName: FormControl = new FormControl();
  selectedSaveGameName: string = '';
  storiesToWritePerRound: number = 1;
  storiesToPlayPerRound: number = 1;
  newSettingFormActivated: boolean = false;
  activatedEditMapFormAdventureId: string = "";

  setNewGame(gameSessionCreated: boolean) {
    this.gameSessionCreated = gameSessionCreated;
    this.refreshLogin.emit(this.userProfile.id);
    this.startGame.emit(gameSessionCreated);
  }

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
        this.selectedSaveGameName = saveGames[0].saveGame.name;
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
    return list;
  }

  setStoriesToPlay(checked: boolean) {
    if (checked) {
      this.storiesToPlayPerRound = this.storiesToWritePerRound + 1;
    } else {
      this.storiesToPlayPerRound = this.storiesToWritePerRound;
    }
  }

  eligibleForPreviousStories(saveGame: SaveGame) {
    const numberOfGlobalStories: number = saveGame.globalStories?.length ?? 0;
    return numberOfGlobalStories > 0;
  }

  onFormSubmit(event: Event) {
    event.preventDefault();
  }  

  activateEditMapForm(activatedEditMapFormAdventureId: string) {
    this.activatedEditMapFormAdventureId = activatedEditMapFormAdventureId;
  }

  deactivateEditMapForm() {
    this.activatedEditMapFormAdventureId = "";
  }

  selectSaveGame(adventureId: string, saveGameId: string, selectedSaveGameName: string) {
    this.adventureId = adventureId;
    this.saveGameId = saveGameId;
    this.selectedSaveGameName = selectedSaveGameName;
    this.activatedSaveGameId = 'none';

    // Scroll to the selected item
    setTimeout(() => {
      const el = document.getElementById(`save-game-${saveGameId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }
    
  createGame() {
    const createGameParameters = "?userProfileId=" + this.userProfile.id 
    + "&adventureId=" + this.adventureId 
    + "&saveGameId=" + this.saveGameId
    + "&storiesToWritePerRound=" + this.storiesToWritePerRound
    + "&storiesToPlayPerRound=" + this.storiesToPlayPerRound;

    this.http
      .post<GameSession>(environment.nowhereBackendUrl + HttpConstants.GAME_SESSION_PATH + createGameParameters, {})
      .subscribe({
        next: (response) => {
          console.log('Game created!', response);
          
          this.gameCode = response.gameCode;
          this.qrCodeUrl = `https://nowhere-player-client-556057816518.us-east4.run.app/game/${response.gameCode}`;
          this.gameSessionCreated = true;
          this.startGame.emit(true);
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
      });
  }

  activateEditNameBox(activatedSaveGameId: string) {
    this.activatedSaveGameId = activatedSaveGameId;
  }

  deactivateEditNameBox() {
    this.activatedSaveGameId = 'none';
  }

  upsertSaveGame(saveGameId: string) {
    console.log("Upsert Save Game: " + saveGameId);
    console.log("Save Game Name: " + this.saveGameName.value);
    const createGameParameters = "?userProfileId=" + this.userProfile.id + "&adventureId=" + this.adventureId;

    const saveGame: SaveGame = {
      name: this.saveGameName?.value ?? '',
      id: saveGameId
    }

    this.http
      .post<SaveGame>(environment.nowhereBackendUrl + HttpConstants.SAVE_GAME_PATH + createGameParameters, saveGame)
      .subscribe({
        next: (response) => {
          console.log('Save Game created!', response);
          this.saveGameId = response.id;
          this.userProfile.maps[this.adventureId].saveGames[response.id] = response;
          this.activatedSaveGameId = 'none';
          this.selectedSaveGameName = response.name;
          this.saveGameName.reset();
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
          this.qrCodeUrl = `https://nowhere-player-client-556057816518.us-east4.run.app/game/${response.gameCode}`;
          this.gameSessionCreated = true;
          this.startGame.emit(true);
        },
        error: (error) => {
          console.error('Error creating game', error);
        },
      });
  }

  toggleNewAdventureMapForm() {
    if (this.newSettingFormActivated === true) {
      this.newSettingFormActivated = false;
    } else {
      this.newSettingFormActivated = true;
    }
  }

  addAdventureMap(adventureMap: AdventureMap) {
    this.userProfile = Object.assign(new UserProfile(), this.userProfile);
    this.userProfile.upsertProfileAdventureMap(new ProfileAdventureMap(adventureMap));
    this.newSettingFormActivated = false;
    this.deactivateEditMapForm();
  }

}
