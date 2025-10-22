import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game-session.service';
import { GameState } from '../assets/game-state';
import { TextSubmission } from '../assets/collaborative-text-phase';

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

  winningSubmissions: TextSubmission[] = [];
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
        next: (submissions) => {
          this.winningSubmissions = submissions;
          if (this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER && submissions.length > 0) {
            this.favorEntity = submissions[0].currentText || 'the Entity';
          }
          this.startTextAnimation();
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

  isInNewStatTypePhase(): boolean {
    return this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS;
  }

  isWinningPhase(): boolean {
    return this.gameState === GameState.WHERE_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_DO_WE_FEAR_VOTE_WINNER ||
           this.gameState === GameState.WHO_ARE_WE_VOTE_WINNER ||
           this.gameState === GameState.WHAT_IS_COMING_VOTE_WINNER ||
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF_VOTE_WINNERS;
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
      case GameState.WRITE_ENDING_TEXT:
        return 'How will our story end?';
      default:
        return 'Collaborative Writing';
    }
  }

  getPhaseInstruction(): string {
    if (this.isWinningPhase() && !this.isInNewStatTypePhase()) {
      console.log('Winning phase');
      return 'The winning submission is...';
    } else if (this.isInNewStatTypePhase()) {
      console.log('New stat type phase');
      return 'The winning submissions are...';
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

    let collaborativeTextSimpleModeInstruction = '<br><br>Submit as many ideas as you can from your device!';
    let collaborativeTextCollaborativeModeInstruction = '<br><br>Look to your device and don\'t worry about thinking too hard about what you say. Your friends will help!';
    switch (this.gameState) {
      case GameState.WHERE_ARE_WE:
        collaborativeTextInstruction = 'We will begin by describing our world.';
        break;
      case GameState.WHAT_DO_WE_FEAR:
        collaborativeTextInstruction = 'What do we fear? What person, group, or entity holds power in this world?';
        collaborativeTextInstruction += collaborativeTextSimpleModeInstruction;
        break;
      case GameState.WHO_ARE_WE:
        collaborativeTextInstruction = 'Define who we are together. What is our goal?';
        collaborativeTextInstruction += collaborativeTextCollaborativeModeInstruction;
        break;
      case GameState.WHAT_IS_COMING:
        collaborativeTextInstruction = 'An event will occur at the end of the season where we will be judged by ' + this.favorEntity + '. What must we each do when they arrive to ensure our success or survival?';
        collaborativeTextInstruction += collaborativeTextCollaborativeModeInstruction;
        break;
      case GameState.WHAT_ARE_WE_CAPABLE_OF:
        collaborativeTextInstruction = 'We will need certain skills in order to overcome. List anything you think we will need to be good at to survive.';
        collaborativeTextInstruction += collaborativeTextSimpleModeInstruction;
        break;
      case GameState.WRITE_ENDING_TEXT:
        collaborativeTextInstruction = 'Based on how well we have done as a group, write the ending text that will be displayed. This will determine how our story concludes.';
        collaborativeTextInstruction += collaborativeTextCollaborativeModeInstruction;
        break;
      default:
        return 'Do your best to answer the question above!';
    }

    console.log('Collaborative text instruction:', collaborativeTextInstruction);
    return collaborativeTextInstruction;
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
           this.gameState === GameState.WRITE_ENDING_TEXT ||
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
           this.gameState === GameState.WHAT_ARE_WE_CAPABLE_OF ||
           this.gameState === GameState.WRITE_ENDING_TEXT;
  }
}
