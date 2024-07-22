import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserViewService } from 'app/main/apps/user/user-view/user-view.service';
import { UserService } from 'services/user.service';
import { Projet } from 'models/projet';

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
   @Input() userId: number;
   projets: Projet[] = [];
  // private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {UserViewService} _userViewService
   */
  constructor(private router: Router, private _userViewService: UserViewService,private _userService:UserService, private route: ActivatedRoute) {
    this._unsubscribeAll = new Subject();
    this.lastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
  }
  loadProjects(): void {
    this._userService.getProjectsByUser(this.userId).subscribe((projets: Projet[]) => {
      this.projets = projets;
    });
  }
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
   ngOnInit(): void {
    const userId = +this.route.snapshot.paramMap.get('idUser');  // Récupère l'ID de l'utilisateur depuis l'URL
    this._userService.getProjectsByUser(userId).subscribe((data: Projet[]) => {
      this.projets = data;
    });
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
