import { Component, Input } from '@angular/core';
import { Trait, TraitType } from '../assets/trait';

@Component({
  selector: 'trait-badges',
  templateUrl: './trait-badges.component.html',
  styleUrl: './trait-badges.component.scss'
})
export class TraitBadgesComponent {
  @Input() traits: Trait[] = [];

  getBadgeColor(traitType: TraitType | undefined): string {
    return traitType?.color || '#0288d1';
  }

  getBadgePrefix(traitType: TraitType | undefined): string {
    return (traitType?.name || 'Trait').toLowerCase();
  }
}
