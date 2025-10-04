import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game-session.service';
import { Player } from '../assets/player';
import { ActiveGameStateSession } from 'src/assets/active-game-state-session';

@Component({
  selector: 'app-player-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-progress.component.html',
  styleUrl: './player-progress.component.scss'
})
export class PlayerProgressComponent implements OnInit, OnChanges {
  @Input() gameCode: string = '';
  @Input() activeGameStateSession: ActiveGameStateSession = new ActiveGameStateSession();

  players: Player[] = [];
  completedPlayers: string[] = [];
  isVisible = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    if (this.gameCode) {
      this.loadPlayers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeGameStateSession'] && this.activeGameStateSession) {
      this.updateCompletedPlayers();
    }
  }

  private loadPlayers() {
    console.log('Loading players for game code:', this.gameCode);
    this.gameService.getPlayers(this.gameCode).subscribe({
      next: (players) => {
        this.players = players;
        this.updateCompletedPlayers();
      },
      error: (error) => {
        console.error('Error loading players:', error);
      }
    });
  }

  private updateCompletedPlayers() {
    if (!this.activeGameStateSession?.isPlayerDone || !this.players.length) {
      return;
    }

    const newCompletedPlayers: string[] = [];
    
    // Check which players are done
    this.players.forEach(player => {
      if (this.activeGameStateSession.isPlayerDone.get(player.authorId) === true) {
        newCompletedPlayers.push(player.authorId);
        console.log('Player', player.userName, 'is done');
      }
    });

    console.log('New completed players:', newCompletedPlayers);

    // Update visibility based on whether any players are done
    this.isVisible = newCompletedPlayers.length > 0;

    // Update completed players list
    this.completedPlayers = newCompletedPlayers;
  }

  getPlayerName(playerId: string): string {
    const player = this.players.find(p => p.authorId === playerId);
    return player ? player.userName : 'Unknown Player';
  }

  getPlayerProgress(): number {
    if (!this.players.length) return 0;
    return (this.completedPlayers.length / this.players.length) * 100;
  }


  getBubbleColor(index: number): string {
    const colors = [
      '#4caf50', // Green
      '#2196f3', // Blue
      '#ff9800', // Orange
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#f44336', // Red
      '#00bcd4', // Cyan
      '#ffeb3b'  // Yellow
    ];
    return colors[index % colors.length];
  }
}
