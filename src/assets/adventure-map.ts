import { GameSessionDisplay } from "./game-session-display";
import { StatType } from "./stat-type";
import { Location } from "./location";
import { Story } from "./story";

export class AdventureMap {
    name: string = "";
    adventureId: string = "";
    gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();
    locations: Location[] = [];
    statTypes: StatType[] = [];
    ritual: Story = new Story();

    constructor() {
        this.name = "";
        this.adventureId = "";
        this.locations = [];
        this.ritual = new Story();
    }
}