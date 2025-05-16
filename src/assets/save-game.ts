import { Story } from './story';

export class SaveGame {
  id: string = '';
  globalStories: Story[] = [];

  constructor() {
    this.id = '';
    this.globalStories = [];
  }
}