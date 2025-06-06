import { Injectable } from '@angular/core';
import { DocumentReference, Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private firestore: Firestore) {}

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
}
