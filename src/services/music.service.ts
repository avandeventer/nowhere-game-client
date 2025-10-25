import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private backgroundMusic: HTMLAudioElement = new Audio();
  private isMusicEnabled = new BehaviorSubject<boolean>(true);
  private currentMusicTrack: string = '';

  constructor() {
    // Set up audio properties
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3; // Set a reasonable volume
    
    // Load initial state from localStorage
    const savedState = localStorage.getItem('musicEnabled');
    if (savedState !== null) {
      this.isMusicEnabled.next(JSON.parse(savedState));
    }
  }

  get isMusicEnabled$() {
    return this.isMusicEnabled.asObservable();
  }

  get isMusicCurrentlyEnabled(): boolean {
    return this.isMusicEnabled.value;
  }

  toggleMusic(): void {
    const newState = !this.isMusicEnabled.value;
    this.isMusicEnabled.next(newState);
    localStorage.setItem('musicEnabled', JSON.stringify(newState));
    
    if (newState && this.currentMusicTrack) {
      this.playMusicTrack(this.currentMusicTrack);
    } else {
      this.backgroundMusic.pause();
    }
  }

  playMusicTrack(trackName: string): void {
    if (!this.isMusicEnabled.value) {
      return;
    }

    this.backgroundMusic.pause();
    
    this.backgroundMusic.src = `https://storage.googleapis.com/nowhere_images/music/${trackName}`;
    
    this.backgroundMusic.load();
    this.backgroundMusic.play().catch(error => {
      console.log('Autoplay prevented:', error);
    });
    this.currentMusicTrack = trackName;
  }

  stopMusic(): void {
    this.backgroundMusic.pause();
  }

  setVolume(volume: number): void {
    this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
  }
}
