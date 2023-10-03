import { Component, OnInit } from '@angular/core';
// import { Log } from 'ng-log';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary" class="mb-3">
      <h1 class="text-center w-100">🎶 Songs erraten - Der Partyspaß 🥳</h1>
    </mat-toolbar>


    <div class="container">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {

  // private static readonly LOGGER = new Log(AppComponent.name);

  constructor() {
  }

  ngOnInit(): void {
  }

}
