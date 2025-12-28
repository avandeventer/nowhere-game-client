import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../services/game-session.service';
import { GameBoard } from '../assets/game-board';
import { Encounter, EncounterType } from '../assets/encounter';
import { PlayerCoordinates } from '../assets/player-coordinates';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit, OnChanges {
  @Input() gameCode: string = '';
  @Input() gameBoard: GameBoard | null = null;
  
  isLoading = false;
  previousCoordinates: PlayerCoordinates | null = null;
  isAnimating = false;
  animationDirection: 'east' | 'west' | null = null;
  currentEncounter: Encounter | null = null;
  eastEncounter: Encounter | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    if (!this.gameBoard && this.gameCode) {
      this.loadGameBoard();
    } else if (this.gameBoard) {
      this.updateDisplayedEncounters();
      this.previousCoordinates = this.gameBoard.playerCoordinates ? 
        { xCoordinate: this.gameBoard.playerCoordinates.xCoordinate, yCoordinate: this.gameBoard.playerCoordinates.yCoordinate } : null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameBoard'] && this.gameBoard) {
      const newCoords = this.gameBoard.playerCoordinates;
      const oldCoords = this.previousCoordinates;
      
      // Check if coordinates changed
      if (oldCoords && newCoords && 
          (oldCoords.xCoordinate !== newCoords.xCoordinate || 
           oldCoords.yCoordinate !== newCoords.yCoordinate)) {
        this.detectMovementDirection(oldCoords, newCoords);
      }
      
      this.updateDisplayedEncounters();
      this.previousCoordinates = newCoords ? 
        { xCoordinate: newCoords.xCoordinate, yCoordinate: newCoords.yCoordinate } : null;
    } else if (changes['gameCode'] && this.gameCode && !this.gameBoard) {
      this.loadGameBoard();
    }
  }

  private detectMovementDirection(oldCoords: PlayerCoordinates, newCoords: PlayerCoordinates) {
    const deltaX = newCoords.xCoordinate - oldCoords.xCoordinate;
    
    // Determine direction of movement (grid moves opposite to player movement)
    // Since player only moves east, we only need to handle east/west
    if (deltaX > 0) {
      // Player moved east, grid slides west
      this.animationDirection = 'west';
    } else if (deltaX < 0) {
      // Player moved west, grid slides east
      this.animationDirection = 'east';
    }
    
    // Trigger animation
    this.isAnimating = true;
    
    // Reset after animation completes
    setTimeout(() => {
      this.isAnimating = false;
      this.animationDirection = null;
    }, 600); // Match CSS transition duration
  }

  private loadGameBoard() {
    if (!this.gameCode) return;
    
    this.isLoading = true;
    this.gameService.getGameBoard(this.gameCode).subscribe({
      next: (gameBoard: GameBoard) => {
        this.gameBoard = gameBoard;
        this.updateDisplayedEncounters();
        this.previousCoordinates = gameBoard.playerCoordinates ? 
          { xCoordinate: gameBoard.playerCoordinates.xCoordinate, yCoordinate: gameBoard.playerCoordinates.yCoordinate } : null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading game board:', error);
        this.isLoading = false;
      }
    });
  }

  private updateDisplayedEncounters() {
    if (!this.gameBoard || !this.gameBoard.playerCoordinates) {
      return;
    }

    const playerCoords = this.gameBoard.playerCoordinates;
    const x = playerCoords.xCoordinate;
    const y = playerCoords.yCoordinate;

    // Get current location encounter
    this.currentEncounter = this.getEncounterAt(x, y);
    
    // Get only the first east encounter
    this.eastEncounter = this.getEncounterAt(x + 1, y);
  }

  private getEncounterAt(x: number, y: number): Encounter | null {
    if (!this.gameBoard || !this.gameBoard.dungeonGrid) {
      return null;
    }
    const key = `${x},${y}`;
    return this.gameBoard.dungeonGrid[key] || null;
  }

  getEncounterIcon(encounter: Encounter | null): string {
    if (!encounter) {
      return 'help_outline';
    }
    if (encounter.encounterType === EncounterType.FINAL) {
      return 'https://storage.googleapis.com/nowhere_images/location_icons/Skull.png';
    }
    if (encounter.visited) {
      return 'check_circle';
    }
    return 'explore';
  }

  isEncounterIconImage(encounter: Encounter | null): boolean {
    return encounter?.encounterType === EncounterType.FINAL;
  }

  isFinalEncounter(encounter: Encounter | null): boolean {
    return encounter?.encounterType === EncounterType.FINAL;
  }

  shouldShowCampfireAfterCurrent(): boolean {
    return this.eastEncounter !== null;
  }
}

