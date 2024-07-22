import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { ChatService } from 'app/main/apps/chat/chat.service';
import { UserService } from 'services/user.service';
import { User } from 'models/user';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html'
})
export class ChatSidebarComponent implements OnInit {
  // Public
  public contacts;
  public chatUsers;
  public searchText;
  public chats;
  public selectedIndex = null;
  public userProfile;
  users: User[];
  currentUser: User;
  /**
   * Constructor
   *
   * @param {ChatService} _chatService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(private _chatService: ChatService, private _coreSidebarService: CoreSidebarService, private userService:UserService,private _httpClient: HttpClient) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Open Chat
   *
   * @param id
   * @param newChat
   */
  openChat(id) {
    this._chatService.openChat(id);

    // Reset unread Message to zero
    this.chatUsers.map(user => {
      if (user.id === id) {
        user.unseenMsgs = 0;
      }
    });
  }

  /**
   * Toggle Sidebar
   *
   * @param name
   */
  toggleSidebar(name) {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  /**
   * Set Index
   *
   * @param index
   */
  setIndex(index: number) {
    this.selectedIndex = index;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._chatService.getUserFromToken().subscribe(
      (user: User) => {
        this.currentUser = user;
      },
      error => {
        console.error('Erreur lors de la récupération du currentUser:', error);
        // Gérer l'erreur comme nécessaire, par exemple, rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      }
    );
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
    // Subscribe to contacts
    this._chatService.onContactsChange.subscribe(res => {
      this.contacts = res;
    });

    let skipFirst = 0;

    // Subscribe to chat users
    this._chatService.onChatUsersChange.subscribe(res => {
      this.chatUsers = res;

      // Skip setIndex first time when initialized
      if (skipFirst >= 1) {
        this.setIndex(this.chatUsers.length - 1);
      }
      skipFirst++;
    });

    // Subscribe to selected Chats
    this._chatService.onSelectedChatChange.subscribe(res => {
      this.chats = res;
    });

    // Add Unseen Message To Chat User
    this._chatService.onChatsChange.pipe(first()).subscribe(chats => {
      chats.map(chat => {
        this.chatUsers.map(user => {
          if (user.id === chat.userId) {
            user.unseenMsgs = chat.unseenMsgs;
          }
        });
      });
    });

    // Subscribe to User Profile
    this._chatService.onUserProfileChange.subscribe(response => {
      this.userProfile = response;
    });
  }
  openChatWithUser(user: User) {
    const url = `http://localhost:4200/USER-SERVICE/api/messages/${this.currentUser.idUser}/${user.idUser}`;
    this._httpClient.get(url).subscribe(
      response => {
        console.log('Chat initialized:', response);
        this.openChat(user.idUser);
        this.toggleSidebar('chat-sidebar');
      },
      error => {
        console.error('Error initializing chat:', error);
      }
    );
  }
}
