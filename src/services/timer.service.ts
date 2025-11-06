import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';
import { HttpConstants } from '../assets/http-constants';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  constructor(private http: HttpClient) { }

  /**
   * Calls the backend to advance to the next game phase
   * @param gameCode The current game code
   * @returns Observable of the response
   */
  nextGamePhase(gameCode: string): Observable<any> {
    return this.http.put(
      environment.nowhereBackendUrl + HttpConstants.NEXT_GAME_SESSION_PATH + '?gameCode=' + gameCode, 
      {}
    );
  }

  /**
   * Handles the timer completion by advancing to the next game phase
   * @param gameCode The current game code
   * @returns Observable of the response
   */
  onTimerComplete(gameCode: string): Observable<any> {
    console.log('Timer completed, advancing to next game phase...');
    return this.nextGamePhase(gameCode);
  }

  /**
   * Sets writeTimerDone to true for the active player session
   * @param gameCode The current game code
   * @returns Observable of the updated ActivePlayerSession
   */
  setWriteTimerDone(gameCode: string): Observable<any> {
    console.log('Setting writeTimerDone to true for game:', gameCode);
    const activePlayerSession = {
      gameCode: gameCode,
      writeTimerDone: true
    };
    return this.http.put(
      environment.nowhereBackendUrl + HttpConstants.ACTIVE_PLAYER_SESSION_PATH,
      activePlayerSession
    );
  }
}
