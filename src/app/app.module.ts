import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { environment } from "../environments/environment";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MySocket } from "./socket.service";

const config: SocketIoConfig = {
  url: environment.socketUrl, // socket server url;
  options: {
    transports: ['websocket']
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [MySocket],
  bootstrap: [AppComponent]
})
export class AppModule { }
