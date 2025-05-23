import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { HttpConstants } from "src/assets/http-constants";
import { Story } from "src/assets/story";
import { environment } from "src/environments/environments";

@Component({
    selector: 'finale',
    styles: `.btn { padding: 5px; }`,
    templateUrl: './finale.component.html',
    standalone: true,
    imports: [MatButtonModule, MatProgressSpinner]
})
export class FinaleComponent {
    @Input() gameCode = '';
    isLoadingSelection: boolean = false;
    storiesSaved: boolean = false;
    @Output() gameSessionCreated = new EventEmitter<boolean>();

    constructor(private http: HttpClient) {
        console.log('GameSessionComponent initialized');
    }

    saveStories() {
        if (!this.isLoadingSelection) {
            this.isLoadingSelection = true;

            const createGameParameters = "?gameCode=" + this.gameCode;
        
            this.http
            .put<Story[]>(environment.nowhereBackendUrl + HttpConstants.ADMIN_STORY + createGameParameters, {})
            .subscribe({
                next: (response) => {
                    this.isLoadingSelection = false;
                    console.log('Stories saved!', response);
                    this.storiesSaved = true;
                },
                error: (error) => {
                    this.isLoadingSelection = false;
                    console.error('Error creating game', error);
                },
            });
        }
    }

    newGame() {
        this.gameSessionCreated.emit(false);
    }
}