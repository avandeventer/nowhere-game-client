import { OutcomeStat } from "./outcome-stat";
import { PlayerStat } from "./player-stat";

export class Option {
    optionId: string;
    optionText: string;
    attemptText: string;
    successText: string;
    playerStatDCs: PlayerStat[]
    successResults: OutcomeStat[];
    failureResults: OutcomeStat[];

    constructor () {
        this.optionId = "";
        this.optionText = "";
        this.attemptText = "";
        this.successText = "";
        this.playerStatDCs = [];
        this.successResults = [];
        this.failureResults = [];
    }
}