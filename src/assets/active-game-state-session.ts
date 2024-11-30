export class ActiveGameStateSession {
    isPlayerDone: Map<string, boolean>;

    constructor() {
        this.isPlayerDone = new Map<string, boolean>();
    }
}