import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivePlayerSession } from 'src/assets/active-player-session';
import { DefiningTrait } from 'src/assets/defining-trait';
import { Player } from 'src/assets/player';
import { GameService } from 'src/services/game-session.service';
import { TraitBadgesComponent } from 'src/trait-badges/trait-badges.component';

@Component({
  selector: 'player-traits-summary',
  templateUrl: './player-traits-summary.component.html',
  imports: [MatCardModule, TraitBadgesComponent],
  styleUrl: './player-traits-summary.component.scss'
})
export class PlayerTraitsSummaryComponent implements OnInit, OnChanges {
  @Input() gameCode: string = '';
  @Input() activePlayerSession: ActivePlayerSession = new ActivePlayerSession();

  player: Player | undefined;
  private players: Player[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getPlayers(this.gameCode).subscribe({
      next: (players: Player[]) => {
        this.players = players;
        this.setPlayer();
      },
      error: (error: any) => console.error('Error getting players', error)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activePlayerSession']) {
      this.setPlayer();
    }
  }

  get definingTrait(): DefiningTrait | undefined {
    return this.player?.definingTraits?.find(trait => trait.type === 'DEFINING');
  }

  get priceTrait(): DefiningTrait | undefined {
    return this.player?.definingTraits?.find(trait => trait.type === 'PRICE');
  }

  private setPlayer(): void {
    this.player = this.players.find(player => player.authorId === this.activePlayerSession.playerId);
  }
}
