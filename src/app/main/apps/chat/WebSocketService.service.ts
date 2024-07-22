// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import {  Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
    private stompClient;
    private baseUrl = '/USER-SERVICE';
    private messageSubject = new Subject<any>();
  
    connect() {
      const socket = new SockJS(`${this.baseUrl}/ws`);
      this.stompClient = Stomp.over(socket);
  
      this.stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);
      });
    }
  
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          console.log('Disconnected');
        });
      }
    }
  
    sendMessage(destination: string, message: any) {
      console.log('Sending message to:', destination, message);
      this.stompClient.send(destination, {}, JSON.stringify(message));
    }
  
    subscribe(destination: string) {
      return this.stompClient.subscribe(destination, (message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    }
  
    getMessageObservable() {
      return this.messageSubject.asObservable();
    }
}
