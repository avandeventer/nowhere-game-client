import { RepercussionOutput } from "./repercussion-output";
import { Story } from "./story";
import { Location } from "./location";

export class ActivePlayerSession {
    playerId: string;
    playerChoiceOptionId: string;
    story: Story;
    location: Location | null;
    selectedLocationOptionId: string;
    locationOutcomeDisplay: string[];
    setNextPlayerTurn: boolean;
    gameCode: string;
    outcomeDisplay: string[];
    repercussions: RepercussionOutput | null;
    startTimer: boolean;

    constructor() {
            this.playerId = "";
            this.playerChoiceOptionId = "";
            this.story = new Story();
            this.location = null;
            this.selectedLocationOptionId = "";
            this.setNextPlayerTurn = false;
            this.gameCode = "";
            this.outcomeDisplay = [];
            this.locationOutcomeDisplay = [];
            this.repercussions = new RepercussionOutput();
            this.startTimer = false;
    }
}