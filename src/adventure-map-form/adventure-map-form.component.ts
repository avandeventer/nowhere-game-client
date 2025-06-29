import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdventureMap } from 'src/assets/adventure-map';
import { OutcomeStat } from 'src/assets/outcome-stat';
import { PlayerStat } from 'src/assets/player-stat';
import { StatType } from 'src/assets/stat-type';
import { AdventureMapService } from 'src/services/adventure-map.service';

@Component({
  selector: 'adventure-map-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatDividerModule
  ],
  styleUrl: './adventure-map-form.component.scss',
  templateUrl: './adventure-map-form.component.html',
})
export class AdventureMapFormComponent implements OnInit {
  @Input() userProfileId: string = "";
  @Output() adventureMapOutput = new EventEmitter<AdventureMap>();
  @Input() adventureMap: AdventureMap = new AdventureMap();
  adventureMapForm!: FormGroup;
  locationsFormActivated: boolean = false;

  constructor(private fb: FormBuilder, private adventureMapService: AdventureMapService) {}

  ngOnInit(): void {
    this.adventureMapForm = this.fb.group({
      adventureId: [''],
      name: ['', Validators.required],
      gameSessionDisplay: this.fb.group({
        mapDescription: [''],
        goalDescription: [''],
        playerTitle: [''],
        playerDescription: [''],
        endingDescription: [''],
        successText: [''],
        neutralText: [''],
        failureText: [''],
      }),
      statTypes: this.fb.array([]),
      locations: this.fb.array([])
    });

    if (
      this.adventureMap.adventureId !== null 
      && this.adventureMap.adventureId !== ""
    ) {
      this.patchFormWithAdventureMap(this.adventureMap);
      this.locationsFormActivated = true;
    }

    if(this.adventureMap.statTypes === null 
      || this.adventureMap.statTypes.length === 0
      || !this.adventureMap.statTypes.some(s => s.favorType)) {
        this.addFavorStat();
    } else if (this.adventureMap.statTypes.some(s => s.favorType)) {
      const favorIndex = this.adventureMap.statTypes.findIndex(s => s.favorType);
      const [favorStat] = this.adventureMap.statTypes.splice(favorIndex, 1);

      this.adventureMap.statTypes.unshift(favorStat);
      this.patchFormWithAdventureMap(this.adventureMap);
      console.log("shifted statTypes " + this.adventureMap.statTypes);
    }
  }

  private addFavorStat(): void {
    const favorStatGroup = this.fb.group({
      label: ['Favor'],
      description: [''],
      favorType: [true],
      favorEntity: ['', Validators.required]
    });
  
    this.statTypes.insert(0, favorStatGroup);
  }

  get statTypes(): FormArray {
    return this.adventureMapForm.get('statTypes') as FormArray;
  }

  get locations(): FormArray {
    return this.adventureMapForm.get('locations') as FormArray;
  }

  addStatType(): void {
    this.statTypes.push(
      this.fb.group({
        label: [''],
        description: [''],
      })
    );
  }

  removeStatType(index: number): void {
    this.statTypes.removeAt(index);
  }

  addLocation(): void {
    this.locations.push(
      this.fb.group({
        label: [''],
        description: [''],
        iconDirectory: [''],
        options: this.fb.array([
          this.createOptionGroup(), 
          this.createOptionGroup()
        ])
      })
    );
  }

  getOptions(location: AbstractControl): FormArray {
    return location.get('options') as FormArray;
  }
  
  createOptionGroup(): FormGroup {
    return this.fb.group({
      optionText: [''],
      attemptText: [''],
      successResults: this.fb.control([])
    });
  }
  
  removeLocation(index: number): void {
    this.locations.removeAt(index);
  }

  activateLocationsForm() {
    this.locationsFormActivated = true;
  }

  submit(): void {
    const formValue: AdventureMap = this.adventureMapForm.value;
    console.log('Submitting AdventureMap:', formValue);
    this.adventureMapService.createAdventureMap(
      this.userProfileId,
      formValue
    ).subscribe({
      next: (adventureMap) => {
        console.log("Saved adventure map!:", adventureMap);
        this.adventureMap = adventureMap;
        this.locationsFormActivated = true;
        this.patchFormWithAdventureMap(adventureMap);
      },
      error: (err) => {
        console.error("Error:", err);
      }
    });
  }

  update(): void {
    const formValue = structuredClone(this.adventureMapForm.value);

    formValue.locations.forEach((loc: any) => {
      loc.options.forEach((opt: any) => {
        opt.successResults = this.toOutcomeStats(opt.successResults);
      });
    });
    
    formValue.adventureId = this.adventureMap.adventureId;
    console.log('Submitting AdventureMap:', formValue);    

    this.adventureMapService.updateAdventureMap(
      this.userProfileId,
      formValue
    ).subscribe({
      next: (adventureMap) => {
        console.log("Saved adventure map!:", adventureMap);
        this.adventureMapOutput.emit(adventureMap);
        this.adventureMap = adventureMap;
        this.patchFormWithAdventureMap(adventureMap);
      },
      error: (err) => {
        console.error("Error:", err);
      }
    });
  }

  private toOutcomeStats(statIds: string[]): OutcomeStat[] {
    return statIds
      .map(id => {
        const statType = this.adventureMap.statTypes.find(s => s.id === id);
        if (!statType) return null;
  
        return {
          playerStat: {
            statType,
            value: 1
          }
        };
      })
      .filter((o): o is { playerStat: PlayerStat } => o !== null);
  }

  private patchFormWithAdventureMap(map: AdventureMap): void {
    this.adventureMapForm.patchValue({
      name: map.name,
      gameSessionDisplay: {
        mapDescription: map.gameSessionDisplay?.mapDescription,
        playerTitle: map.gameSessionDisplay?.playerTitle,
        playerDescription: map.gameSessionDisplay?.playerDescription,
        endingDescription: map.gameSessionDisplay?.endingDescription,
        goalDescription: map.gameSessionDisplay?.goalDescription,
        successText: map.gameSessionDisplay?.successText,
        neutralText: map.gameSessionDisplay?.neutralText,
        failureText: map.gameSessionDisplay?.failureText
      }
    });
  
    const statTypeFGs = map.statTypes.map(stat =>
      this.fb.group({
        id: [stat.id],
        label: [stat.label],
        description: [stat.description],
        favorEntity: [stat.favorEntity],
        favorType: [stat.favorType]
      })
    );
    this.adventureMapForm.setControl('statTypes', this.fb.array(statTypeFGs));
  
    const locationFGs = map.locations.map(loc =>
      this.fb.group({
        id: [loc.id],
        label: [loc.label],
        description: [loc.description],
        iconDirectory: [loc.iconDirectory],
        options: this.fb.array(loc.options.map(opt =>
          this.fb.group({
            optionText: [opt.optionText],
            attemptText: [opt.attemptText],
            successResults: [opt.successResults.map(res => res.playerStat.statType.id)]
          })
        ))
      })
    );
    this.adventureMapForm.setControl('locations', this.fb.array(locationFGs));
  }
}
