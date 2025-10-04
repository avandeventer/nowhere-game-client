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
}
