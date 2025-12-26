import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Story } from '../assets/story';
import { Option } from '../assets/option';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss'
})
export class StoryComponent implements OnChanges {
  @Input() story: Story | undefined = new Story();
  
  // Track displayed options to add new ones when they appear
  private displayedOptions: Option[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['story'] && this.story?.options) {
      const currentOptions = this.story.options;
      
      // Find new options that aren't already in displayedOptions
      const newOptions = currentOptions.filter(newOption => 
        !this.displayedOptions.some(displayedOption => 
          displayedOption.optionId === newOption.optionId
        )
      );
      
      // Add new options to the displayed list
      if (newOptions.length > 0) {
        this.displayedOptions = [...this.displayedOptions, ...newOptions];
      }
      
      // Also update existing options if their data changed
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

  getOptions(): Option[] {
    // Return displayed options, or fall back to story options if displayedOptions is empty
    if (this.displayedOptions.length > 0) {
      return this.displayedOptions;
    }
    return this.story?.options || [];
  }

  getSelectedOption(): Option | undefined {
    if (!this.story?.selectedOptionId) {
      return undefined;
    }
    return this.getOptions().find(option => option.optionId === this.story?.selectedOptionId);
  }

  isOptionSelected(option: Option): boolean {
    return this.story?.selectedOptionId === option.optionId;
  }
}

