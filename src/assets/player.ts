export class Player {
  userName: String;
  strength: number;
  intellect: number;
  charisma: number;
  dexterity: number;
  wealth: number;
  magic: number;
  authorId: String;

  constructor() {
    this.userName = '';
    this.strength = 0;
    this.intellect = 0;
    this.charisma = 0;
    this.dexterity = 0;
    this.wealth = 0;
    this.magic = 0;
    this.authorId = "";
  }
}