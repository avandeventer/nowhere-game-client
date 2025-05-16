import { AdventureMap } from './adventure-map';
import { SaveGame } from './save-game';

export class ProfileAdventureMap {
  adventureMap: AdventureMap;
  saveGames: Record<string, SaveGame>;

  constructor(adventureMap: AdventureMap, initialSaveGame?: SaveGame) {
    this.adventureMap = adventureMap;
    this.saveGames = {};

    if (initialSaveGame) {
      this.saveGames[initialSaveGame.id] = initialSaveGame;
    } else {
      const newSaveGame = new SaveGame();
      this.saveGames[newSaveGame.id] = newSaveGame;
    }
  }

  upsertSaveGame(updatedSaveGame: SaveGame): void {
    this.saveGames[updatedSaveGame.id] = updatedSaveGame;
  }

  getSaveGameById(saveGameId: string): SaveGame | undefined {
    return this.saveGames[saveGameId];
  }
}