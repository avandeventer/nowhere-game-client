import { ProfileAdventureMap } from './profile-adventure-map';

export class UserProfile {
  id: string;
  email: string;
  password: string;
  maps: Record<string, ProfileAdventureMap>;

  constructor() {
    this.id = '';
    this.email = '';
    this.password = '';
    this.maps = {};
  }

  upsertProfileAdventureMap(updatedMap: ProfileAdventureMap): void {
    const adventureId = updatedMap.adventureMap.adventureId;
    this.maps[adventureId] = updatedMap;
  }
}
