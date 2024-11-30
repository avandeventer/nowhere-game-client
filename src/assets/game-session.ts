import { ActiveGameStateSession } from './active-game-state-session';
import { Player } from './player';

export class GameSession {
  gameCode: string;
  players: Player[];
  activeGameStateSession: ActiveGameStateSession;

  constructor(gameCode: string, players: Player[], activeGameStateSession: ActiveGameStateSession) {
    this.gameCode = gameCode;
    this.players = players;
    this.activeGameStateSession = activeGameStateSession;
  }
}
