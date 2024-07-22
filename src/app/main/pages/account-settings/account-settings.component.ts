import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FlatpickrOptions } from 'ng2-flatpickr';
import { cloneDeep } from 'lodash';
import { AccountSettingsService } from 'app/main/pages/account-settings/account-settings.service';
import { UserService } from 'services/user.service';
import { NgForm } from '@angular/forms';
import { LoginService } from 'services/login.service';
import { Router } from '@angular/router';
import { AuthenticationService } from 'app/auth/service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountSettingsComponent implements OnInit, OnDestroy {
  public data: any = { user: {} }; // Initialize with an empty user object
  public rows;
  public urlLastValue;
  public tempRow;
  public currentRow;
  public contentHeader: object;
  public url = this.router.url;
  public birthDateOptions: FlatpickrOptions = { altInput: true };
  public passwordTextTypeOld = false;
  public passwordTextTypeNew = false;
  public passwordTextTypeRetype = false;
  public avatarImage: string;
  public selectedFile: File | null = null;
  public loading = false;

  @ViewChild('accountForm') accountForm: NgForm;
  @ViewChild('passwordForm') passwordForm: NgForm;
  private _unsubscribeAll: Subject<any>;

  constructor(
    private router: Router,
    private _accountSettingsService: AccountSettingsService,
    private loginService: LoginService,
    private _userService: UserService,
    private _authenticationService :AuthenticationService
  ) {
    this.urlLastValue = this.url.substr(this.url.lastIndexOf('/') + 1);
    this._unsubscribeAll = new Subject();
  }

  togglePasswordTextTypeOld() {
    this.passwordTextTypeOld = !this.passwordTextTypeOld;
  }

  togglePasswordTextTypeNew() {
    this.passwordTextTypeNew = !this.passwordTextTypeNew;
  }

  togglePasswordTextTypeRetype() {
    this.passwordTextTypeRetype = !this.passwordTextTypeRetype;
  }

  uploadImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      let reader = new FileReader();

      reader.onload = (event: any) => {
        this.avatarImage = event.target.result;
      };

      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (!this.accountForm.valid) {
      console.error('Form is not valid');
      return;
    }

    const user = { ...this.data.user, avatar: this.avatarImage };
     // Extract the user data from the form
   // Remove password fields if not provided
   if (!user.password) {
    delete user.password;
  }
   const formData = new FormData();
      // Check if the password fields are filled

    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    const userId = this.data.user.idUser; // Ensure userId is provided

    if (userId) {
      this.loading = true;
      this._userService.updateUser(formData, userId).subscribe(
        (response) => {
         
          console.log('User updated successfully:', response);
          this._authenticationService.updateCurrentUser(response);
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error updating user:', error);
        }
      );
    } else {
      console.error('User ID is missing');
    }
  }

  private findAndSetCurrentRow(): void {
    this.rows.map((row) => {
      if (row.entity.idUser == this.urlLastValue) {
        this.currentRow = row;
        this.avatarImage = this.currentRow.entity.image?.imagenUrl || 'default-avatar-url';
        this.tempRow = cloneDeep(row);
      }
    });
  }
  changePassword(): void {
    if (!this.passwordForm.valid) {
      console.error('Password form is not valid');
      return;
    }
  
    const { oldPassword, newPassword, retypeNewPassword } = this.passwordForm.value;
    const userId = this.data.user.idUser; // Ensure userId is provided
  
    if (userId) {
      this.loading = true;
      this._userService.changePassword(userId, oldPassword, newPassword, retypeNewPassword).subscribe(
        (response) => {
          this.loading = false;
          console.log('Password changed successfully:', response);
        },
        (error) => {
          this.loading = false;
          console.error('Error changing password:', error);
        }
      );
    } else {
      console.error('User ID is missing');
    }
  }
  ngOnInit() {
    const accessToken = this.loginService.getToken();
    if (accessToken) {
      this._userService.getUserFromToken(accessToken).subscribe(
        (user: any) => {
          this.data.user = user || {}; // Ensure user is an object
          this.avatarImage = user?.image?.imagenUrl || 'default-avatar-url';
        },
        (error: any) => {
          console.error('Error fetching user data:', error);
          this.data.user = {}; // Initialize to avoid undefined issues
        }
      );
    } else {
      console.warn('No access token found');
      this.data.user = {}; // Initialize to avoid undefined issues
    }

    this._accountSettingsService.onSettingsChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.data = response;
      this.avatarImage = this.data.accountSetting?.general?.avatar || 'default-avatar-url';
    });

    this.contentHeader = {
      headerTitle: 'Account Settings',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          { name: 'Home', isLink: true, link: '/' },
          { name: 'Pages', isLink: true, link: '/' },
          { name: 'Account Settings', isLink: false }
        ]
      }
    };
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
