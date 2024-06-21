import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthenticationService } from 'app/auth/service';
import { CoreConfigService } from '@core/services/config.service';
import { LoginService } from 'services/login.service';
import { UserService } from 'services/user.service';
import { User } from 'models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth-login-v2',
  templateUrl: './auth-login-v2.component.html',
  styleUrls: ['./auth-login-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthLoginV2Component implements OnInit {
  //  Public
  public coreConfig: any;
  public loginForm: UntypedFormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public error = '';
  public passwordTextType: boolean;
  registerLoginData = {  } as any;
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private loginService : LoginService , private userService:UserService,
    private _coreConfigService: CoreConfigService,
    private _formBuilder: UntypedFormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private toastr: ToastrService,
    private _authenticationService: AuthenticationService
  ) {

    // redirect to home if already logged in
    if (this._authenticationService.currentUserValue) {
      this._router.navigate(['/']);
    }

    this._unsubscribeAll = new Subject();

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }
 
  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }
  currentUser : User;
 

  
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    console.log(this.registerLoginData)

    // Login
    this.loading = true;
    this._authenticationService.login(this.registerLoginData).pipe(first()).subscribe(
      data => {//alert("Welcome ! "); 
                localStorage.setItem("accessToken",data.accessToken) ; 
                this.userService.getUserFromToken(data.accessToken).subscribe(
                  data => {this.currentUser = data
                    localStorage.setItem("idUser",String(this.currentUser.idUser)) ;

                    if(this.currentUser.role.roleName == "admin" || this.currentUser.role.roleName == "operateur"){
                    
                     // alert("");
                      this.toastr.success('Bienvenue dans espace admin !', 'Notification');
                      this._router.navigate([this.returnUrl]);
    
                    }
                  }
                ) ; 
                 
            },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
      }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
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
}
