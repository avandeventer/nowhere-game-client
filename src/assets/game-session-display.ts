export class GameSessionDisplay {
    mapDescription: string;
    goalDescription: string;
    endingDescription: string;
    successText: string;
    neutralText: string;
    failureText: string;

    constructor() {
        this.mapDescription = "";
        this.goalDescription = "";
        this.endingDescription = "";
        this.successText = "";
        this.neutralText = "";
        this.failureText = "";
    }
}