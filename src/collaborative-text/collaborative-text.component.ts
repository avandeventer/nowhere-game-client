import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game-session.service';
import { GameState } from '../assets/game-state';
import { TextSubmission } from '../assets/collaborative-text-phase';
import { StatType } from 'src/assets/stat-type';

@Component({
  selector: 'app-collaborative-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collaborative-text.component.html',
  styleUrl: './collaborative-text.component.scss'
})
export class CollaborativeTextComponent implements OnInit, OnChanges {
  @Input() gameCode: string = '';
  @Input() gameState: GameState = GameState.WHERE_ARE_WE;

  winningSubmission: TextSubmission | null = null;
  isAnimating = false;
  currentDisplayText = '';
  displayIndex = 0;
  showDisplay = false;
  favorEntity: string = 'the Entity';

  constructor(private gameService: GameService) {}

  ngOnInit() { 
    setTimeout(() => {
      this.showDisplay = true;
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameState'] && this.isWinningPhase()) {
      this.loadWinningSubmission();
    }

    if (this.isCollaborativeTextWritingPhase()) {
      this.showDisplay = false;
      // Reset animation after it completes
      setTimeout(() => {
        this.showDisplay = true;
      }, 1000);
    }
  }

  private loadWinningSubmission() {
    if (this.isWinningPhase()) {
      this.gameService.getWinningSubmission(this.gameCode).subscribe({
        next: (submission) => {
          this.winningSubmission = submission;
          if (this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER) {
            this.favorEntity = this.winningSubmission?.currentText || 'the Entity';
          }
          this.startTextAnimation();
        },
        error: (error) => {
          console.error('Error loading winning submission:', error);
        }
      });
    } else {
      this.winningSubmission = null;
      this.currentDisplayText = '';
      this.displayIndex = 0;
    }
  }

  isWinningPhase(): boolean {
    return this.gameState === GameState.WHERE_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE_WINNER ||
           this.gameState === GameState.WHO_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER ||
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS;
  }

  private startTextAnimation() {
    if (!this.winningSubmission) return;

    this.isAnimating = true;
    this.currentDisplayText = '';
    this.displayIndex = 0;

    const textAdditions = this.winningSubmission.additions;
    
    const animateNextWord = () => {
      if (this.displayIndex < textAdditions.length) {
        this.currentDisplayText += (this.displayIndex > 0 ? ' ' : '') + textAdditions[this.displayIndex].addedText;
        this.displayIndex++;
        setTimeout(animateNextWord, 200); // 200ms delay between words
      } else {
        this.isAnimating = false;
      }
    };

    animateNextWord();
  }

  getPhaseQuestion(): string {
    switch (this.gameState) {
      case GameState.WHERE_ARE_WE:
      case GameState.WHERE_ARE_WE_VOTE:
      case GameState.WHERE_ARE_WE_VOTE_WINNER:
        return 'Where are we?';
      case GameState.WHAT_DO_WE_FEAR:
      case GameState.WHAT_DO_WE_FEAR_VOTE:
      case GameState.WHAT_DO_WE_FEAR_VOTE_WINNER:
        return 'What do we fear?';
      case GameState.WHO_ARE_WE:
      case GameState.WHO_ARE_WE_VOTE:
      case GameState.WHO_ARE_WE_VOTE_WINNER:
        return 'Who are we?';
      case GameState.WHAT_IS_COMING:
      case GameState.WHAT_IS_COMING_VOTE:
      case GameState.WHAT_IS_COMING_VOTE_WINNER:
        return 'What is coming?';
      case GameState.WHAT_ARE_WE_CAPABLE_OF:
      case GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE:
      case GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS:
        return 'What are we capable of?';
      default:
        return 'Collaborative Writing';
    }
  }

  getPhaseInstruction(): string {
    if (this.isWinningPhase()) {
      console.log('Winning phase');
      return 'The winning submission is...';
    } else if (this.isVotingPhase()) {
      console.log('Voting phase');
      return 'The time has come to solidify our fate. Rank the descriptions on your device starting with your favorite first.';
    } else {
      console.log('Collaborative text phase');
      return this.getCollaborativeTextInstruction();
    }
  }

  getCollaborativeTextInstruction() {
    let collaborativeTextInstruction = '';

    switch (this.gameState) {
      case GameState.WHERE_ARE_WE:
        collaborativeTextInstruction = 'We will begin by describing our world.';
        break;
      case GameState.WHAT_DO_WE_FEAR:
        collaborativeTextInstruction = 'What do we fear? What person, group, or entity holds power in this world?';
        break;
      case GameState.WHO_ARE_WE:
        collaborativeTextInstruction = 'Define who we are together. What is our goal?';
        break;
      case GameState.WHAT_IS_COMING:
        collaborativeTextInstruction = 'Something is coming. An event that will occur at the end of the season where we will encounter ' + this.favorEntity + ' and be judged. What must we each do when it arrives to ensure our success or survival?';
        break;
      case GameState.WHAT_ARE_WE_CAPABLE_OF:
        collaborativeTextInstruction = 'We will need certain skills in order to overcome. List anything you thing we will need to be good at to survive.';
        break;
      default:
        return 'Do your best to answer the question above!';
    }

    console.log('Collaborative text instruction:', collaborativeTextInstruction);
    return collaborativeTextInstruction + ' Look to your device and don\'t worry about thinking too hard about what you say. Your friends will help!';
  }

  isVotingPhase(): boolean {
    return this.gameState === GameState.WHERE_ARE_WE_VOTE ||
           this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE ||
           this.gameState === GameState.WHO_ARE_WE_VOTE ||
           this.gameState === GameState.WHAT_IS_COMING_VOTE ||
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE;
  }

  isCollaborativeTextPhase(): boolean {
    return this.gameState === GameState.WHERE_ARE_WE || 
           this.gameState === GameState.WHAT_DO_WE_FEAR ||
           this.gameState === GameState.WHO_ARE_WE || 
           this.gameState === GameState.WHAT_IS_COMING || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF ||
           this.gameState === GameState.WHERE_ARE_WE_VOTE || 
           this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE ||
           this.gameState === GameState.WHO_ARE_WE_VOTE || 
           this.gameState === GameState.WHAT_IS_COMING_VOTE || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE ||
           this.gameState === GameState.WHERE_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE_WINNER ||
           this.gameState === GameState.WHO_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER ||
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS;
  }

  isCollaborativeTextWritingPhase(): boolean {
    return this.gameState === GameState.WHERE_ARE_WE || 
           this.gameState === GameState.WHAT_DO_WE_FEAR ||
           this.gameState === GameState.WHO_ARE_WE || 
           this.gameState === GameState.WHAT_IS_COMING || 
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF;
  }
}
