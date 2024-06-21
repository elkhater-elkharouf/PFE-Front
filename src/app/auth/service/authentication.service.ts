import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'services/user.service';
import { columnGroupWidths } from '@swimlane/ngx-datatable';
import { data } from 'autoprefixer';
import { Image } from '../models/image';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService, 
    private userService : UserService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUserSubject.value && this.currentUserSubject.value.role && this.currentUserSubject.value.role.roleName=='admin';
  }

  /**
   *  Confirms if user is client
   */
  get isClient() {
    return this.currentUserSubject.value && this.currentUserSubject.value.role && this.currentUserSubject.value.role.roleName=='client';
  }

  /**
   * User login
   *
   * @param email
   * @param password
   * @returns user
   */


  login(userObj: User) {
    
    return this._http
      .post<any>(`/USER-SERVICE/login`,userObj)
      .pipe(
        map(user => {
          // login successful if there's a jwt token in the response
          if (user ) {
           //localStorage.setItem('accessToken',user.token);
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
           

            //this.currentUser = JSON.parse(localStorage.getItem('currentUser')).user;
            // Display welcome toast!
            setTimeout(() => {
              this._toastrService.success(

                'You have successfully logged in as an ' +
                  user.role +
                  ' user to Vuexy. Now you can start to explore. Enjoy! 🎉',
                '👋 Welcome, ' +  user.user.fname+ '!',
                { toastClass: 'toast ngx-toastr', closeButton: true }
              );
            }, 2500);

            // notify
            this.currentUserSubject.next(user);
            
          }

          return user;
        })
      );
  }

  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // notify
    this.currentUserSubject.next(null);
  }
}
