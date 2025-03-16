import { RitualStory } from "./ritual-story";
import { Story } from "./story";

export class ActivePlayerSession {
    playerId: String;
    playerChoiceOptionId: String;
    story: Story;
    selectedLocationOptionId: String;
    locationOutcomeDisplay: String[];
    setNextPlayerTurn: boolean;
    gameCode: String;
    outcomeDisplay: String[];
    ritualStory: RitualStory;

    constructor() {
            this.playerId = "";
            this.playerChoiceOptionId = "";
            this.story = new Story();
            this.selectedLocationOptionId = "";
            this.setNextPlayerTurn = false;
            this.gameCode = "";
            this.outcomeDisplay = [];
            this.locationOutcomeDisplay = [];
            this.ritualStory = new RitualStory();
    }
}