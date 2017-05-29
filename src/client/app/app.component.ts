import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<h1>Hello {{name}}</h1><a href="https://github.com/DavidZhang309/minimum-angular">Github</a>`,
})
export class AppComponent  { name = 'Angular'; }
