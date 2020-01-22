import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

const MAT_MODULES = [
  MatButtonModule,
  // MatMenuModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatChipsModule,
  MatDividerModule,
  MatListModule,
];

const IMP_EXPORT_MODULES = [
  BrowserModule,
  CommonModule,
  HttpClientModule,
  ReactiveFormsModule,
  FormsModule,


  ...MAT_MODULES
];

@NgModule({
  declarations: [],
  imports: [
    ...IMP_EXPORT_MODULES
  ],
  providers: [],
  exports: [
    ...IMP_EXPORT_MODULES
  ]
})
export class AppCommonModule {
}
