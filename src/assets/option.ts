import { OutcomeStat } from "./outcome-stat";
import { PlayerStat } from "./player-stat";

export class Option {
    optionId: string;
    optionText: string;
    attemptText: string;
    successText: string;
    failureText: string;
    playerStatDCs: PlayerStat[]
    successResults: OutcomeStat[];
    failureResults: OutcomeStat[];
    selectedByPlayerId: string;
    playerSucceeded: boolean;
    pointsRewarded: number;
    successMarginText: string;

    constructor () {
        this.optionId = "";
        this.optionText = "";
        this.attemptText = "";
        this.successText = "";
        this.failureText = "";
        this.playerStatDCs = [];
        this.successResults = [];
        this.failureResults = [];
        this.selectedByPlayerId = "";
        this.playerSucceeded = false;
        this.pointsRewarded = 0;
        this.successMarginText = "";
    }
}