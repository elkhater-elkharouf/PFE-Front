import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean{
      const token = localStorage.getItem('accessToken');
      if (token){
        return true
      }else{
        this.router.navigate(['/pages/authentication/login-v2'], { queryParams: { returnUrl: state.url } })
        return false
      }
    }
}