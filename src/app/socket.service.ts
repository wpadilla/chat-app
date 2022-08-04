import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { Injectable } from "@angular/core";

Injectable({ providedIn: 'root'})
export class MySocket extends Socket {
  constructor() {
    super({url: environment.socketUrl, options: {}});
    this.ioSocket.auth = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTQwMTIzNTQsInVzZXIiOnsidXNlclR5cGUiOiIxIiwidXNlcklEIjoiMTAifSwiY2xhaW1zIjpudWxsfQ.076RbIr5pKogXZHodgmfZm3bcX59I0uBYcnYr5FKVuo'};
  }
}
