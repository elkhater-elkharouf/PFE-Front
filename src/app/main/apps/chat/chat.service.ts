import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';


@Injectable()
export class ChatService {
  public contacts: any[];
  public chats: any[];
  public userProfile;
  public isChatOpen: Boolean;
  public chatUsers: any[];
  public selectedChat;
  public selectedChatUser;

  public onContactsChange: BehaviorSubject<any>;
  public onChatsChange: BehaviorSubject<any>;
  public onSelectedChatChange: BehaviorSubject<any>;
  public onSelectedChatUserChange: BehaviorSubject<any>;
  public onChatUsersChange: BehaviorSubject<any>;
  public onChatOpenChange: BehaviorSubject<Boolean>;
  public onUserProfileChange: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient) {
    this.isChatOpen = false;
    this.onContactsChange = new BehaviorSubject([]);
    this.onChatsChange = new BehaviorSubject([]);
    this.onSelectedChatChange = new BehaviorSubject([]);
    this.onSelectedChatUserChange = new BehaviorSubject([]);
    this.onChatUsersChange = new BehaviorSubject([]);
    this.onChatOpenChange = new BehaviorSubject(false);
    this.onUserProfileChange = new BehaviorSubject([]);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        this.getContacts(),
        this.getChats(),
        this.getUserProfile(),
        this.getActiveChats(),
        this.getChatUsers()
      ]).then(() => {
        resolve();
      }, reject);
    });
  }

  getContacts(): Promise<any[]> {
    const url = `api/chat-contacts`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.contacts = response;
        this.onContactsChange.next(this.contacts);
        resolve(this.contacts);
      }, reject);
    });
  }

  getChats(): Promise<any[]> {
    const url = `api/chat-chats`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.chats = response;
        this.onChatsChange.next(this.chats);
        resolve(this.chats);
      }, reject);
    });
  }

  getUserProfile(): Promise<any[]> {
    const url = `api/chat-profileUser`;

    return new Promise((resolve, reject) => {
      this._httpClient.get(url).subscribe((response: any) => {
        this.userProfile = response;
        this.onUserProfileChange.next(this.userProfile);
        resolve(this.userProfile);
      }, reject);
    });
  }

  getSelectedChatUser(userId) {
    const selectUser = this.contacts.find(contact => contact.id === userId);
    this.selectedChatUser = selectUser;
    this.onSelectedChatUserChange.next(this.selectedChatUser);
  }

  getActiveChats() {
    const chatArr = this.chats.filter(chat => {
      return this.contacts.some(contact => {
        return contact.id === chat.userId;
      });
    });
  }

  getChatUsers() {
    const contactArr = this.contacts.filter(contact => {
      return this.chats.some(chat => {
        return chat.userId === contact.id;
      });
    });
    this.chatUsers = contactArr;
    this.onChatUsersChange.next(this.chatUsers);
  }

  selectedChats(id) {
    const selectChat = this.chats.find(chat => chat.userId === id);

    if (selectChat !== undefined) {
      this.selectedChat = selectChat;
      this.onSelectedChatChange.next(this.selectedChat);
      this.getSelectedChatUser(id);
    } else {
      const newChat = {
        userId: id,
        unseenMsgs: 0
      };
      this.onSelectedChatChange.next(newChat);
      this.getSelectedChatUser(id);
    }
  }

  createNewChat(id, chat) {
    const newChat = {
      userId: id,
      unseenMsgs: 0,
      chat: [chat]
    };

    if (chat.message !== '') {
      return new Promise<void>((resolve, reject) => {
        this._httpClient.post('api/chat-chats/', { ...newChat }).subscribe(() => {
          this.getChats();
          this.getChatUsers();
          this.getSelectedChatUser(id);
          this.openChat(id);
          resolve();
        }, reject);
      });
    }
  }

  openChat(id) {
    this.isChatOpen = true;
    this.onChatOpenChange.next(this.isChatOpen);
    this.selectedChats(id);
  }

  updateChat(chats) {
    return new Promise<void>((resolve, reject) => {
      this._httpClient.post('api/chat-chats/' + chats.id, { ...chats }).subscribe(() => {
        this.getChats();
        resolve();
      }, reject);
    });
  }

  updateUserProfile(userProfileRef) {
    this.userProfile = userProfileRef;
    this.onUserProfileChange.next(this.userProfile);
  }
  getUserFromToken(): Observable<any> {
    // Récupérer l'accessToken depuis le localStorage
    const accessToken = localStorage.getItem('accessToken');

    // Vérifier si l'accessToken existe
    if (!accessToken) {
      throw new Error('AccessToken not found in localStorage');
    }

    // Définir les en-têtes avec l'accessToken
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    // Effectuer la requête GET vers l'API pour récupérer le currentUser
    return this._httpClient.get("/USER-SERVICE/currentUser", { headers });
  }
}