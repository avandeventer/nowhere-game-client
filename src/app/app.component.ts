import { Component } from '@angular/core';
import { LoginComponent } from 'src/login/login.component';

@Component({
    selector: 'app-root',
    template: `<login></login>`,
    imports: [LoginComponent]
})
export class AppComponent {}
