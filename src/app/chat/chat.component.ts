import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  username: string = '';

  constructor(private webSocketService: WebSocketService) { }

  ngOnInit() {
    this.webSocketService.connect('ws://localhost:8080').subscribe(
      (message: any) => {
        // Ensure the message is resolved if it's a promise
        Promise.resolve(message).then((resolvedMessage) => {
          this.messages.push(resolvedMessage);
          console.log(resolvedMessage);
        }).catch((error) => {
          console.error('Message processing error:', error);
        });
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
  }

  sendMessage() {
    if (this.newMessage && this.username) {
      const message = {
        username: this.username,
        text: this.newMessage,
        timestamp: new Date()
      };
      this.webSocketService.sendMessage(message);
      this.newMessage = '';
    }
  }

}
