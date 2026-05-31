import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Story } from '../assets/story';
import { Option } from '../assets/option';
import { GameState } from 'src/assets/game-state';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss'
})
export class StoryComponent implements OnChanges {
  @Input() story: Story | undefined = new Story();
  @Input() gameState: GameState = GameState.INIT;
  @Input() outcomeDisplay: string[] = [];
  @Input() activePlayers: { authorId: string; displayName: string }[] = [];

  getEncounterHeader(): string {
    const names = this.activePlayers.map(p => p.displayName);
    if (names.length === 0) return "You've encountered";
    if (names.length === 1) return `${names[0]} has encountered`;
    if (names.length === 2) return `${names[0]} and ${names[1]} have encountered`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]} have encountered`;
  }

  private displayedOptions: Option[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['story'] && this.story?.options) {
      const currentOptions = this.story.options;

      const newOptions = currentOptions.filter(newOption =>
        !this.displayedOptions.some(displayedOption =>
          displayedOption.optionId === newOption.optionId
        )
      );

      if (newOptions.length > 0) {
        this.displayedOptions = [...newOptions];
      }

      currentOptions.forEach(currentOption => {
        const displayedIndex = this.displayedOptions.findIndex(
          opt => opt.optionId === currentOption.optionId
        );
        if (displayedIndex >= 0) {
          this.displayedOptions[displayedIndex] = currentOption;
        }
      });
    }
  }

  isLocationOptionChoicePhase(): boolean {
    return this.gameState === GameState.LOCATION_OPTION_MAKE_CHOICE_VOTING
      || this.gameState === GameState.LOCATION_OPTION_MAKE_CHOICE_WINNER;
  }

  isPartnerChoicePhase(): boolean {
    return this.gameState === GameState.MAKE_PARTNER_CHOICE_VOTING
      || this.gameState === GameState.MAKE_PARTNER_CHOICE_WINNER
      || this.gameState === GameState.ACCEPT_PARTNER_CHOICE_VOTING
      || this.gameState === GameState.ACCEPT_PARTNER_CHOICE_WINNER;
  }

  getOptions(): Option[] {
    if (this.displayedOptions.length > 0) {
      return this.displayedOptions;
    }
    return this.story?.options || [];
  }

  getEffectiveOptions(): Option[] {
    if (this.isLocationOptionChoicePhase()) {
      return this.story?.location?.options || [];
    }
    return this.getOptions();
  }

  getEffectiveSelectedOptionId(): string | undefined {
    if (this.isLocationOptionChoicePhase()) {
      return this.story?.location?.selectedOptionId || undefined;
    }
    return this.story?.selectedOptionId || undefined;
  }

  getSelectedOption(): Option | undefined {
    const selectedId = this.getEffectiveSelectedOptionId();
    if (!selectedId) return undefined;
    return this.getEffectiveOptions().find(o => o.optionId === selectedId);
  }

  getEffectiveDisplayText(): string | undefined {
    const option = this.getSelectedOption();
    if (!option) return undefined;
    const text = this.isLocationOptionChoicePhase() ? option.attemptText : option.successText;
    return text || undefined;
  }

  isOptionSelected(option: Option): boolean {
    const selectedId = this.getEffectiveSelectedOptionId();
    return !!selectedId && selectedId === option.optionId;
  }
}
