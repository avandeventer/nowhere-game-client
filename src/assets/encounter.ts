import { EncounterLabel } from './encounter-label';

export enum EncounterType {
  NORMAL = 'NORMAL',
  FINAL = 'FINAL'
}

export interface Encounter {
  encounterLabel: EncounterLabel;
  storyId: string;
  storyPrompt: string;
  encounterType: EncounterType;
  visited: boolean;
}

