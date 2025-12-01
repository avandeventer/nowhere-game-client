import { Component, Input } from '@angular/core';
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
export class StoryComponent {
  @Input() story: Story | undefined = new Story();

  getOptions(): Option[] {
    return this.story?.options || [];
  }
}

