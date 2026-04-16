import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { BrowserModule } from '@angular/platform-browser';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

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
