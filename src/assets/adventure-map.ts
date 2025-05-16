import { RitualStory } from "./ritual-story";

export class AdventureMap {
    name: string = "";
    adventureId: string = "";
    locations: Location[] = [];
    ritual: RitualStory = new RitualStory();

    constructor(name: string, adventureId: string, locations: Location[], ritual: RitualStory) {
        this.name = name;
        this.adventureId = adventureId;
        this.locations = locations;
        this.ritual = ritual;
    }
}