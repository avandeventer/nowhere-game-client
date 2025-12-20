import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game-session.service';
import { GameState } from '../assets/game-state';
import { TextSubmission } from '../assets/collaborative-text-phase';
import { GameSessionDisplay } from 'src/assets/game-session-display';
import { CollaborativeTextPhaseInfo, CollaborativeMode, PhaseType } from '../assets/collaborative-text-phase-info';
import { GameBoardComponent } from '../game-board/game-board.component';
import { StoryComponent } from '../story/story.component';
import { GameBoard } from '../assets/game-board';

@Component({
  selector: 'app-collaborative-text',
  standalone: true,
  imports: [CommonModule, GameBoardComponent, StoryComponent],
  templateUrl: './collaborative-text.component.html',
  styleUrl: './collaborative-text.component.scss'
})
export class CollaborativeTextComponent implements OnInit, OnChanges {
  @Input() gameCode: string = '';
  @Input() gameState: GameState = GameState.WHERE_ARE_WE;
  @Input() phaseInfo: CollaborativeTextPhaseInfo | null = null;
  @Input() gameBoard: GameBoard | null = null;

  winningSubmissions: TextSubmission[] = [];
  isAnimating = false;
  currentDisplayText = '';
  displayIndex = 0;
  showDisplay = false;
  favorEntity: string = 'the Entity';
  gameSessionDisplay: GameSessionDisplay = new GameSessionDisplay();

  constructor(private gameService: GameService) {}

  ngOnInit() { 
    this.loadGameSessionDisplay();
    if (this.isWinningPhase()) {
      this.loadWinningSubmission();
    }
    setTimeout(() => {
      this.showDisplay = true;
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameState']) {
      if (this.isWinningPhase()) {
        this.loadWinningSubmission();
      }
      this.loadGameSessionDisplay();
    }

    if (changes['phaseInfo'] && this.isWinningPhase()) {
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
        next: (submissions) => {
          this.winningSubmissions = submissions;
          // For WHAT_WILL_BECOME_OF_US, don't display the text - keep it secret
          if (!this.isSecretWinningPhase()) {
            this.startTextAnimation();
          }
        },
        error: (error) => {
          console.error('Error loading winning submissions:', error);
        }
      });
    } else {
      this.winningSubmissions = [];
      this.currentDisplayText = '';
      this.displayIndex = 0;
    }
  }

  loadGameSessionDisplay() {
    this.gameService.getGameSessionDisplay(this.gameCode).subscribe({
      next: (display) => {
        this.gameSessionDisplay = display;
      },
      error: (error) => {
        console.error('Error loading game session display:', error);
      }
    });
  }


  isInMultipleWinnersPhase(): boolean {
    return this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS || this.gameState === GameState.HOW_DOES_THIS_RESOLVE_WINNERS || this.gameState === GameState.WHAT_CAN_WE_TRY_WINNERS;
  }

  isWinningPhase(): boolean {
    return this.phaseInfo?.phaseType === PhaseType.WINNING;
  }

  isSecretWinningPhase(): boolean {
    return this.gameState === GameState.WHAT_WILL_BECOME_OF_US_VOTE_WINNER || this.gameState === GameState.HOW_DOES_THIS_RESOLVE_WINNERS;
  }

  private startTextAnimation() {
    if (this.winningSubmissions.length === 0) return;

    this.isAnimating = true;
    this.currentDisplayText = '';
    this.displayIndex = 0;

    // For WHAT_ARE_WE_CAPABLE_OF, show all submissions
    if (this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS) {
      this.animateMultipleSubmissions();
    } else {
      // For other phases, show the single submission
      this.animateSingleSubmission(this.winningSubmissions[0]);
    }
  }

  private animateSingleSubmission(submission: TextSubmission) {
    const textAdditions = submission.additions;
    
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

  private animateMultipleSubmissions() {
    let currentSubmissionIndex = 0;
    
    const animateNextSubmission = () => {
      if (currentSubmissionIndex < this.winningSubmissions.length) {
        const submission = this.winningSubmissions[currentSubmissionIndex];
        this.currentDisplayText = submission.currentText;
        currentSubmissionIndex++;
        
        if (currentSubmissionIndex < this.winningSubmissions.length) {
          setTimeout(animateNextSubmission, 1000); // 1 second delay between submissions
        } else {
          this.isAnimating = false;
        }
      }
    };

    animateNextSubmission();
  }

  getPhaseQuestion(): string {
    if (this.phaseInfo) {
      return this.phaseInfo.phaseQuestion;
    }
    return '';
  }

  getPhaseInstruction(): string {
    if (this.phaseInfo) {
      return this.phaseInfo.phaseInstructions;
    }
    
    return 'The winning submission is...';
  }

  getCollaborativeModeLabel(): string {
    if (this.phaseInfo?.collaborativeMode === CollaborativeMode.RAPID_FIRE) {
      return 'RAPID FIRE';
    } else if (this.phaseInfo?.collaborativeMode === CollaborativeMode.SHARE_TEXT) {
      return 'COLLABORATIVE MODE';
    }
    return '';
  }

  isVotingPhase(): boolean {
    return this.phaseInfo?.phaseType === PhaseType.VOTING;
  }

  isCollaborativeTextWritingPhase(): boolean {
    return this.phaseInfo?.phaseType === PhaseType.SUBMISSION;
  }
}
