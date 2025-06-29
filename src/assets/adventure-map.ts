import { GameSessionDisplay } from "./game-session-display";
import { RitualStory } from "./ritual-story";
import { StatType } from "./stat-type";
import { Location } from "./location";

export class AdventureMap {
    name: string = "";
    adventureId: string = "";
    gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();
    locations: Location[] = [];
    statTypes: StatType[] = [];
    ritual: RitualStory = new RitualStory();

    constructor() {
        this.name = "";
        this.adventureId = "";
        this.locations = [];
        this.ritual = new RitualStory();
    }
}