import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, doc, docData } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environments';
import { HttpConstants } from '../assets/http-constants';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {}

  listenForGameStateChanges(gameCode: string): Observable<{ gameState: string | null; didWeSucceed: boolean; activePlayerSession: any | null; activeGameStateSession: any | null }> {
    const gameDocRef: DocumentReference = doc(this.firestore, `gameSessions/${gameCode}`) as DocumentReference;

    return docData(gameDocRef).pipe(
      map((data: any) => ({
        gameState: data?.gameState ?? null,
        didWeSucceed: data?.didWeSucceed ?? false,
        activePlayerSession: data?.activePlayerSession ?? null,
        activeGameStateSession: data?.activeGameStateSession ?? null
      }))
    );
  }

  getGameSessionDisplay(gameCode: string): Observable<any> {
    const parameter = "?gameCode=" + gameCode;
    return this.http.get(environment.nowhereBackendUrl + HttpConstants.DISPLAY_PATH + parameter);
  }
}
