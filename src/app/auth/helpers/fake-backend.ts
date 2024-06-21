/**
 *  ? Tip:
 *
 * For Actual Node.js - Role Based Authorization Tutorial with Example API
 * Refer: https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api
 * Running an Angular 9 client app with the Node.js Role Based Auth API
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User, Role } from 'app/auth/models';

// Users with role
 users: User ;

@Injectable()
export class FakeBackendInterceptor  {
  //intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   // const { url, method, headers, body } = request;

}

export const fakeBackendProvider = {};
