import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { map, Observable } from "rxjs";
import { FormControl, FormGroup } from "@angular/forms";
import { MySocket } from "./socket.service";

export enum ChatEvents {
  SEND_MESSAGE = 'send_message',
  EDIT_MESSAGE = 'edit_message',
  DELETE_MESSAGE = 'delete_message',
  LOAD_MESSAGES = 'load_messages',
  LOAD_CONVERSATIONS = 'load_conversations',
  SEND_MESSAGE_FAILED = 'send_message_failed',
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'socket-app';
  messages$: Observable<any> = new Observable<any>();
  conversations$: Observable<any> = new Observable<any>();
  selectedConversation: any = null
  form = new FormGroup({
    message: new FormControl(''),
  });
  newMessage = '';
  activeToken = '';
  activeUserID = '10';
  @ViewChild('messageListWrapper') messageListWrapper?: ElementRef;
  enableMessageOptions?: number;
  enableEditMessage?: number;
  editMessageValue = '';

  constructor(private socket: MySocket) {
  }

  ngAfterViewInit(): void {
    this.socket.on('connect', () => {
      console.log('connected', this.socket)
      this.messages$ = this.socket.fromEvent(ChatEvents.LOAD_MESSAGES)
      this.conversations$ = this.socket.fromEvent(ChatEvents.LOAD_CONVERSATIONS)
      this.conversations$.subscribe(item => {
        console.log("conversations", item);
      })
      this.messages$.subscribe(() => this.scrollConversation())
      this.activeToken = this.socket.ioSocket.auth.token;
      this.socket.emit(ChatEvents.LOAD_CONVERSATIONS, { authToken: this.activeToken })

    })
  }

  getConversation(conversation: any) {
    console.log('conversation =>', conversation);
    this.selectedConversation = conversation;
    this.socket.emit(ChatEvents.LOAD_MESSAGES, { toID: conversation.withID,  authToken: this.activeToken })
    this.scrollConversation()
  }

  sendMessage() {
    const {message } = this.form.value
    console.log('sending');

    this.socket.emit(ChatEvents.SEND_MESSAGE, {
      message: {
        toID: this.selectedConversation.withID,
        fromID: this.selectedConversation.userID,
        message,
        matchID: 1,
      },
      authToken: this.activeToken,
    })

    this.form.setValue({ message: '' })
  }

  scrollConversation() {
    console.log(this.messageListWrapper)
    setTimeout( () => this.messageListWrapper && this.messageListWrapper.nativeElement.scroll(0, 99999))
  }
  tokens: any = {
    user10: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTQwMTIzNTQsInVzZXIiOnsidXNlclR5cGUiOiIxIiwidXNlcklEIjoiMTAifSwiY2xhaW1zIjpudWxsfQ.076RbIr5pKogXZHodgmfZm3bcX59I0uBYcnYr5FKVuo',
    user7: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTQwMzc3NjksInVzZXIiOnsidXNlclR5cGUiOiIxIiwidXNlcklEIjoiNyJ9LCJjbGFpbXMiOm51bGx9.mHyEVXGPQJNEXLn7L3ilVtaD4HvdCAX-qwH99yeHDXk',
    user6: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NTQwMzc4NzksInVzZXIiOnsidXNlclR5cGUiOiIxIiwidXNlcklEIjoiNiJ9LCJjbGFpbXMiOm51bGx9.0ZvqqEPuGQn5usJvwLDMwAz9ujpt_Rwv0xcOpSx73d0',
  }

  selectUser(ev: any) {
    this.socket.disconnect()
    const { value } = ev.target;
    const token = this.tokens[value]
    this.activeToken = token;
    this.activeUserID = value.replace('user', '');
    console.log('ev => ', ev);
    this.socket.ioSocket.auth = { token };
    this.socket.connect()
  }

  toggleMessageOptions = (message: any) => {
    if(message.fromID != this.activeUserID) return;

    if(message.messageID === this.enableMessageOptions) {
      this.enableMessageOptions = 0
    } else {
      this.enableMessageOptions = message.messageID
      this.editMessageValue = message.message;
      this.enableEditMessage = 0;
    }
  }


  deleteMessage = (ev: any, message: any) => {
    ev.stopPropagation();
    console.log('deleting', message)
    this.socket.emit(ChatEvents.DELETE_MESSAGE, {
      messageID: message.messageID,
      authToken: this.activeToken,
    })
    this.enableEditMessage = 0;
    this.enableMessageOptions = 0;
  }

  toggleEditMessage = (ev: any, message: any) => {
    ev.stopPropagation();
    if(message.messageID === this.enableEditMessage) {
      this.enableEditMessage = 0
    } else {
      this.enableEditMessage = message.messageID
    }
  }


  editMessage(ev: any, message: any) {
    ev.stopPropagation();
    message.message = this.editMessageValue;
    this.socket.emit(ChatEvents.EDIT_MESSAGE, {
      message,
      authToken: this.activeToken,
    })
    this.enableEditMessage = 0;
    this.enableMessageOptions = 0;
  }

}
