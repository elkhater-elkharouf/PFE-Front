import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class UserListService implements Resolve<any> {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
    })
  };
  public rows: any;
  public onUserListChanged: BehaviorSubject<any>;
  api=environment.apiUrl;
  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient) {
    // Set the defaults
    this.onUserListChanged = new BehaviorSubject({});
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows(0, 2, 'idUser,asc')]).then(() => {
        resolve();
      }, reject);
    });
  }

  getDataTableRows(page: number, size: number, sort: string): Promise<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return new Promise((resolve, reject) => {
      this._httpClient.get(`/USER-SERVICE/AllUsersPaginated`, { params: params, headers: this.httpOptions.headers }).subscribe((response: any) => {
        if (response && response.content) {
          resolve(response);
        } else {
          reject('Invalid response format');
        }
      }, reject);
    });
  }
}
