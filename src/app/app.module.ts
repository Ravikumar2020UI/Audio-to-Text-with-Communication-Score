import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxJsonViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
