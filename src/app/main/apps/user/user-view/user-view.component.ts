import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserViewComponent implements OnInit, OnDestroy {
  // public
  public url = this.router.url;
  public lastValue;
  public data;
   url2 : string;

  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {UserViewService} _userViewService
   */
  constructor(private router: Router, private _userViewService: UserViewService,private _userService:UserService) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
   ngOnInit(): void {
     this._userViewService.onUserViewChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
    
   //this.data = JSON.parse(localStorage.getItem('currentUser')).user;
      
    }); 
    
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  deleteUser(id:number){
    if (window.confirm('Confirmer la supression')){
      this._userService.deleteUser(id).subscribe(
        data => {alert("suppresion avec succès");location.reload(); },
        error => {alert('suppression erronée');console.log(error);}
      );
    } 
  }
}
