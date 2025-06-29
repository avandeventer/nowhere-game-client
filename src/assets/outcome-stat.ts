import { PlayerStat } from "./player-stat";
import { Stat } from "./stat";

export class OutcomeStat {
    playerStat: PlayerStat;
    
    constructor() {
        this.playerStat = new PlayerStat();
    }
}