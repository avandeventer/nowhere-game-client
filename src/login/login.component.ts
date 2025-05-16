import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { HttpConstants } from "src/assets/http-constants";
import { UserProfile } from "src/assets/user-profile";
import { environment } from "src/environments/environments";
import { GameSessionComponent } from "src/game-session/game-session.component";
import { MatChipSet, MatChip } from '@angular/material/chips'

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [GameSessionComponent,  ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatChipSet, MatChip]
})
export class LoginComponent {

    loginForm: FormGroup;
    createNewProfile: boolean = false;
    loginSuccessful: boolean = false;
    userProfile: UserProfile = new UserProfile();

    constructor(private http: HttpClient, private fb: FormBuilder) {
        console.log('Login initialized');

        this.loginForm = new FormGroup(
            {
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', [Validators.required]),
                confirmPassword: new FormControl('', []),
            },
            {
                validators: this.passwordsMatchValidator(this.createNewProfile),
            }
        );
    }

    private passwordsMatchValidator(createNewProfile: boolean): ValidatorFn {
        return (group: AbstractControl): ValidationErrors | null => {
          if (!createNewProfile) return null;
      
          const passwordControl = group.get('password');
          const confirmPasswordControl = group.get('confirmPassword');
      
          if (!passwordControl || !confirmPasswordControl) return null;
      
          const password = passwordControl.value;
          const confirmPassword = confirmPasswordControl.value;
      
          const passwordsMatch = password === confirmPassword;
      
          if (!passwordsMatch) {
            confirmPasswordControl.setErrors({ passwordMismatch: true });
          } else {
            if (confirmPasswordControl.hasError('passwordMismatch')) {
              confirmPasswordControl.setErrors(null);
            }
          }
      
          return passwordsMatch ? null : { passwordMismatch: true };
        };
      }
      
      
    get email(): FormControl {
        return this.loginForm.get('email') as FormControl;
    }
    
    get password(): FormControl {
        return this.loginForm.get('password') as FormControl;
    }
    
    get confirmPassword(): FormControl {
        return this.loginForm.get('confirmPassword') as FormControl;
    }

    createProfile() {
        this.loginForm.markAllAsTouched();
        console.log("Your loginForm status: " + this.loginForm.invalid);
        if (this.loginForm.invalid) return;

        const userProfile = {
            email: this.email.value ?? '',
            password: this.password.value ?? ''
        }

        this.http
            .post<UserProfile>(environment.nowhereBackendUrl + HttpConstants.USER_PROFILE, userProfile)
            .subscribe({
                next: (response) => {
                    console.log('User profile created!', response);
                    this.userProfile = response;
                    this.loginSuccessful = true;
                },
                error: (error) => {
                    console.error('Error creating game', error);
                },
            });

    }

    changeProfile() {
        this.loginSuccessful = false;
    }

    login() {
        if (this.loginForm.invalid) return;

        const params = {
            email: this.email?.value ?? '',
            password: this.password?.value ?? ''
        };

        this.http.get<UserProfile>(
            environment.nowhereBackendUrl + HttpConstants.USER_PROFILE,
            {
              params
            })
            .subscribe({
            next: (response) => {
                console.log('User login succeeded!', response);
                this.userProfile = response;
                this.loginSuccessful = true;
            },
            error: (error) => {
                console.error('Error logging in', error);
            },
        });
    }

    getNewProfileForm() {
        this.createNewProfile = true;
        this.loginForm.get('confirmPassword')?.setValidators([Validators.required]);
        this.loginForm.get('confirmPassword')?.updateValueAndValidity();

        this.loginForm.setValidators(this.passwordsMatchValidator(this.createNewProfile));
        this.loginForm.updateValueAndValidity();
    }

    backToLogin() {
        this.createNewProfile = false;
        this.loginForm.get('confirmPassword')?.setValidators([]);
        this.loginForm.get('confirmPassword')?.updateValueAndValidity();

        this.loginForm.setValidators(this.passwordsMatchValidator(this.createNewProfile));
        this.loginForm.updateValueAndValidity();    
    }

}