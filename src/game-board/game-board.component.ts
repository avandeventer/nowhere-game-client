import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../services/game-session.service';
import { GameBoard } from '../assets/game-board';
import { Encounter } from '../assets/encounter';
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
  animationDirection: 'north' | 'south' | 'east' | 'west' | null = null;
  currentEncounter: Encounter | null = null;
  northEncounter: Encounter | null = null;
  southEncounter: Encounter | null = null;
  eastEncounter: Encounter | null = null;
  westEncounter: Encounter | null = null;
  northwestEncounter: Encounter | null = null;
  northeastEncounter: Encounter | null = null;
  southeastEncounter: Encounter | null = null;
  southwestEncounter: Encounter | null = null;

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
    const deltaY = newCoords.yCoordinate - oldCoords.yCoordinate;
    
    // Determine direction of movement (grid moves opposite to player movement)
    if (deltaY > 0) {
      // Player moved north, grid slides south
      this.animationDirection = 'south';
    } else if (deltaY < 0) {
      // Player moved south, grid slides north
      this.animationDirection = 'north';
    } else if (deltaX > 0) {
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
    
    // Get adjacent encounters (north, south, east, west)
    this.northEncounter = this.getEncounterAt(x, y + 1);
    this.southEncounter = this.getEncounterAt(x, y - 1);
    this.eastEncounter = this.getEncounterAt(x + 1, y);
    this.westEncounter = this.getEncounterAt(x - 1, y);
    
    // Get diagonal encounters
    this.northwestEncounter = this.getEncounterAt(x - 1, y + 1);
    this.northeastEncounter = this.getEncounterAt(x + 1, y + 1);
    this.southeastEncounter = this.getEncounterAt(x + 1, y - 1);
    this.southwestEncounter = this.getEncounterAt(x - 1, y - 1);
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
    if (encounter.visited) {
      return 'check_circle';
    }
    return 'explore';
  }
}

