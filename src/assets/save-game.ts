import { Story } from './story';

export class SaveGame {
  id: string = '';
  name: string = ''
  globalStories?: Story[] = [];

  constructor() {
    this.id = '';
    this.globalStories = [];
    this.name = '';
  }
}