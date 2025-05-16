import { Component } from '@angular/core';
import { LoginComponent } from 'src/login/login.component';

@Component({
  selector: 'app-root',
  template: `<login></login>`,
  standalone: true,
  imports: [LoginComponent],
})
export class AppComponent {}
