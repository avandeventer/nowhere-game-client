import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivePlayerSession } from "src/assets/active-player-session";
import { GameState } from "src/assets/game-state";
import { Player } from "src/assets/player";
import { Story } from "src/assets/story";
import { Location } from "src/assets/location";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { environment } from "src/environments/environments";
import { HttpConstants } from "src/assets/http-constants";


@Component({
    selector: 'location',
    templateUrl: './location.component.html',
    imports: [MatButtonModule, MatIconModule],
    styleUrl: './location.style.scss'
})
export class LocationComponent implements OnInit {
    @Input() gameState: GameState = GameState.ROUND1;
    @Input() gameCode: string = "";
    @Input() player: Player = new Player();
    @Input() activePlayerSession: ActivePlayerSession = new ActivePlayerSession();
    buttonTransforms: { [key: string]: string } = {};
    mapSize: number = 500;

    locations: Location[] = [];
    selectedStories: Story[] = [];
    locationsSelected: number = 0;
    isLocationsSelected: boolean = false;

    constructor(private http:HttpClient) {}

    ngOnInit(): void {
      this.getLocations(this.gameCode);
    }

    ngAfterViewInit() {
      this.updateMapSize();
      this.updateButtonTransforms();
    
      // Add resize listener
      window.addEventListener('resize', () => {
        this.updateMapSize();
        this.updateButtonTransforms();
      });
    }
    
    private updateMapSize() {
      const mapElement = document.querySelector('.map') as HTMLElement;
      this.mapSize = mapElement ? mapElement.offsetWidth : 500;
      console.log("Updated map size:", this.mapSize);
    }
    
    private updateButtonTransforms() {
      let locationIndex = 0;

      this.locations.forEach((location) => {
        this.buttonTransforms[locationIndex] = this.generateTransformBasedOnId(
          locationIndex,
          this.locations.length
        );
        location.locationIndex = locationIndex;
        locationIndex += 1;
      });
    }
    
    getLocations(gameCode: string) {
      const parameter = "?gameCode=" + gameCode;

      this.http
      .get<Location[]>(environment.nowhereBackendUrl + HttpConstants.LOCATION_PATH + parameter)
      .subscribe({
        next: (response) => {
          this.locations = response;
  
          let locationIndex = 0;
          this.locations.forEach((location) => {
            this.buttonTransforms[locationIndex] =  this.generateTransformBasedOnId(
              locationIndex,
              this.locations.length // Total number of locations
            );
            location.locationIndex = locationIndex;
            locationIndex += 1;
          });
        },
        error: (error) => {
          console.error('Error fetching locations', error);
        },
      });
    }

    generateTransformBasedOnId(locationId: number, totalButtons: number): string {
      const mapElement = document.querySelector('.map') as HTMLElement;
      const mapSize = mapElement.offsetWidth; // Use dynamic size
      const exampleButton: HTMLElement = document.querySelector('.location-button') as HTMLElement;
      const buttonWidth = exampleButton ? exampleButton.offsetWidth : 40;
      const buttonHeight = exampleButton ? exampleButton.offsetHeight : 50;

      const mapCenter = mapSize / 2 - 10; // Center of the map
      const maxAllowedRadius = 180; // <-- tweak this to keep buttons inside your visual circle
      const maxRadiusByHeight = window.innerHeight / 2; // Example threshold
      const maxRadiusByWidth = window.innerWidth / 2;
      const dynamicRadius = mapCenter - (totalButtons * 20);
      const radius = Math.min(dynamicRadius, maxAllowedRadius, maxRadiusByHeight, maxRadiusByWidth);
          
      const angle = (2 * Math.PI / totalButtons) * locationId; // Evenly spaced angle
    
      // Calculate positions relative to the center
      const x = Math.cos(angle) * radius + (mapCenter - buttonWidth / 2); // Adjust for button width
      const y = Math.sin(angle) * radius + (mapCenter - buttonHeight / 2); // Adjust for button height
    
      console.log("Button position (id, x, y):", locationId, x, y);
      console.log("Radius in button function", radius);
      console.log("Map size in button function", mapSize);
      console.log("Button height", buttonHeight);
      console.log("Button width", buttonWidth);
    
      return `translate(${x}px, ${y}px)`;
    }    
}