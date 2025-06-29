export class StatType {
    id: string;
    label: string;
    favorType: boolean;
    description: string;
    favorEntity: string;

    constructor () {
        this.id = "";
        this.label = "";
        this.description = "";
        this.favorType = false;
        this.favorEntity = "";
    }
}