import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
      //public
      public currentUser: Observable<User>;

      //private
      private currentUserSubject: BehaviorSubject<User>;
    
  urlLogin ="/USER-SERVICE/login";
  constructor(private http:HttpClient , private router:Router) {  this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
  this.currentUser = this.currentUserSubject.asObservable();}

  Login(user:any){
    // this.list.push(p)
     return this.http.post<any>(this.urlLogin, user);
   }
   loggedIn() {
    return !!localStorage.getItem('accessToken')
  }
  
  getToken(){ 
    return localStorage.getItem('accessToken')
  }
  
  logoutUser(){
    localStorage.removeItem('accessToken');
    this.router.navigate(['/login'])
  }

  autologout(expirationDate: number){
    setTimeout(
      ()=> {this.logoutUser();} 
      ,expirationDate 
    );
  }


}
