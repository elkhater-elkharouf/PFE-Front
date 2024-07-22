import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { ChatService } from 'app/main/apps/chat/chat.service';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../WebSocketService.service';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html'
})


export class ChatContentComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') scrollMe: ElementRef;
  scrolltop: number = null;

  public activeChat: Boolean;
  public chats;
  public chatUser;
  public userProfile;
  public chatMessage = '';
  public newChat: any;  // Déclarez `newChat` ici
  private subscription: Subscription;
  public loadingMessages: boolean = false;

  constructor(
    private _chatService: ChatService,
    private _coreSidebarService: CoreSidebarService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this._chatService.onChatOpenChange.subscribe(res => {
      this.chatMessage = '';
      this.activeChat = res;
      setTimeout(() => {
        this.scrolltop = this.scrollMe?.nativeElement.scrollHeight;
      }, 0);
    });

    this._chatService.onSelectedChatChange.subscribe(res => {
      this.chats = res;
    });

    this._chatService.onSelectedChatUserChange.subscribe(res => {
      this.chatUser = res;
      if (this.chatUser && this.userProfile) {
        const user1 = this.userProfile.username;
        const user2 = this.chatUser.username;
        this.subscribeToMessages(user1, user2);
        this.loadMessages(user1, user2);
      }
    });

    this.userProfile = this._chatService.userProfile;

    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      this.userProfile = {
        username: decodedToken.sub,
      };
    }

    this.websocketService.connect();

    this.subscription = this.websocketService.getMessageObservable().subscribe((message) => {
      this.handleReceivedMessage(message);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  subscribeToMessages(user1: string, user2: string) {
    this.websocketService.subscribe(`/queue/reply-${user1}`);
    this.websocketService.subscribe(`/queue/reply-${user2}`);
  }

  loadMessages(user1: string, user2: string) {
    this.loadingMessages = true;
    axios.get(`/USER-SERVICE/api/messages/${user1}/${user2}`)
      .then((response) => {
        const fetchedMessages = response.data.map((message) => JSON.parse(message.content));
        this.chats.messages = fetchedMessages;
        this.loadingMessages = false;
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        this.loadingMessages = false;
      });
  }

  handleReceivedMessage(message) {
    console.log('Received message:', message);
    if (message.user.idUser !== this.userProfile.username) {
      this.chats.messages.push(message);
    }
  }

  updateChat() {
    this.newChat = {
      message: this.chatMessage,
      time: new Date().toISOString(),
      senderId: this.userProfile.id
    };

    if (this.chats && this.chats.messages) {
      if (this.newChat.message !== '') {
        this.chats.messages.push(this.newChat);
        this._chatService.updateChat(this.chats);
        this.websocketService.sendMessage(`/app/user-message-${this.chatUser.username}`, this.newChat);
        this.chatMessage = '';
        setTimeout(() => {
          this.scrolltop = this.scrollMe?.nativeElement.scrollHeight;
        }, 0);
      }
    } else {
      this._chatService.createNewChat(this.chatUser.id, this.newChat);
      this.websocketService.sendMessage(`/app/user-message-${this.chatUser.username}`, this.newChat);
    }
  }

  toggleSidebar(name) {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }
  startConversationWithUser(): void {
    this.activeChat = true;
    this.chatUser = {
      fullName: 'User Full Name',
      avatar: 'path/to/avatar.jpg',
      status: 'online',
      username: 'username'
    };
    this._chatService.onSelectedChatUserChange.next(this.chatUser);
    this.toggleSidebar('chat-sidebar');
  }
}