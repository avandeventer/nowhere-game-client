import { Option } from './option';

export class Location {
    locationId: number;
    description: string;
    locationIndex: number;

    id: string;
    label: String;
    options: Option[];
    iconDirectory: String;
    selectedOptionId: string;

    constructor () {
        this.locationId = 0;
        this.description = "";
        this.locationIndex = 0;
        this.id = "";
        this.label = "";
        this.options = [];
        this.iconDirectory = "";
        this.selectedOptionId = "";
    }
}