import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'environments/environment';
import { User } from 'app/auth/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   *
   * @param {HttpClient} _http
   */
  constructor(private _http: HttpClient) {}

  /**
   * Get all users
   */
  getAll() {
    return this._http.get<User[]>('/USER-SERVICE/AllUsers');
  }

  /**
   * Get user by id
   */
  getById(id: number) {
    return this._http.get<User>("/USER-SERVICE/getUserById/"+id );
  }
  getImageById(userId: string): Observable<any> {
    const url = `/USER-SERVICE/imageByUser/${userId}`;
    return this._http.get(url);
  }
}
