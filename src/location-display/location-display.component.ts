import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-display.component.html',
  styleUrl: './location-display.component.scss'
})
export class LocationDisplayComponent {
  @Input() iconDirectory: string = '';
  @Input() label: string = '';
  @Input() players: { authorId: string; displayName: string }[] = [];

  getBubbleColor(index: number): string {
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', '#f44336', '#00bcd4', '#ffeb3b'];
    return colors[index % colors.length];
  }
}
