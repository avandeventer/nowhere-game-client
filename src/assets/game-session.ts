import { Player } from './player';

export class GameSession {
  gameCode: string;
  players: Player[];

  constructor(gameCode: string, players: Player[]) {
    this.gameCode = gameCode;
    this.players = players;
  }
}
