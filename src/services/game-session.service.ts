import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, doc, docData } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environments';
import { HttpConstants } from '../assets/http-constants';
import { Player } from '../assets/player';
import { TextSubmission } from '../assets/collaborative-text-phase';
import { ActivePlayerSession } from '../assets/active-player-session';
import { GameSessionDisplay } from 'src/assets/game-session-display';
import { WinState } from 'src/assets/win-state';
import { CollaborativeTextPhaseInfo } from '../assets/collaborative-text-phase-info';
import { GameBoard } from '../assets/game-board';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {}

  listenForGameStateChanges(gameCode: string): Observable<{ gameState: string | null; didWeSucceed: boolean; activePlayerSession: any | null; activeGameStateSession: any | null; totalPointsTowardsVictory: number | null; adventureMap: any | null; collaborativeTextPhases: any | null; gameBoard: GameBoard | null}> {
    const gameDocRef: DocumentReference = doc(this.firestore, `gameSessions/${gameCode}`) as DocumentReference;

    return docData(gameDocRef).pipe(
      map((data: any) => ({
        gameState: data?.gameState ?? null,
        didWeSucceed: data?.didWeSucceed ?? false,
        activePlayerSession: data?.activePlayerSession ?? null,
        activeGameStateSession: data?.activeGameStateSession ?? null,
        totalPointsTowardsVictory: data?.totalPointsTowardsVictory ?? 0,
        adventureMap: data?.adventureMap ?? null,
        collaborativeTextPhases: data?.collaborativeTextPhases ?? null,
        gameBoard: data?.gameBoard ?? null
      }))
    );
  }

  getGameSessionDisplay(gameCode: string): Observable<GameSessionDisplay> {
    const parameter = "?gameCode=" + gameCode;
    return this.http.get<GameSessionDisplay>(environment.nowhereBackendUrl + HttpConstants.DISPLAY_PATH + parameter) as Observable<GameSessionDisplay>;
  }

  getPlayers(gameCode: string): Observable<Player[]> {
    const params = {
      gameCode: gameCode
    };

    return this.http.get<Player[]>(environment.nowhereBackendUrl + HttpConstants.PLAYER_PATH, { params });
  }

  getWinningSubmission(gameCode: string): Observable<TextSubmission[]> {
    const params = {
      gameCode: gameCode
    };

    return this.http.get<TextSubmission[]>(environment.nowhereBackendUrl + '/collaborativeText/winner', { params });
  }

  getVictory(gameCode: string): Observable<WinState> {
    const params = {
      gameCode: gameCode
    };

    return this.http.get<WinState>(environment.nowhereBackendUrl + HttpConstants.VICTORY_PATH, { params });
  }

  getCollaborativeTextPhaseInfo(gameCode: string): Observable<CollaborativeTextPhaseInfo> {
    return this.http.get<CollaborativeTextPhaseInfo>(`${environment.nowhereBackendUrl}/collaborativeText/phaseInfo?gameCode=${gameCode}`);
  }

  getGameBoard(gameCode: string): Observable<GameBoard> {
    return this.http.get<GameBoard>(`${environment.nowhereBackendUrl}/game-board?gameCode=${gameCode}`);
  }
}
