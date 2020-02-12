import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SimulatorComponent } from './simulator/simulator.component';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';

const appRoutes: Routes = [
  { path: 'simulator', component: SimulatorComponent },
  { path: 'faq', component: FaqComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    SimulatorComponent,
    FaqComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, useHash: true}
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
