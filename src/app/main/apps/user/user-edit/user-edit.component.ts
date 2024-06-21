import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { DialogRef, DialogService } from "@ngneat/dialog";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FlatpickrOptions } from "ng2-flatpickr";
import { cloneDeep } from "lodash";

import { UserEditService } from "app/main/apps/user/user-edit/user-edit.service";
import { PartialUser, Role } from "app/auth/models";
import { RoleService } from "services/role.service";
import { ToastrService } from "ngx-toastr";
import { UserService } from "services/user.service";
import { HttpClient } from "@angular/common/http";
import { User } from "models/user";

@Component({
  selector: "app-user-edit",
  templateUrl: "./user-edit.component.html",
  styleUrls: ["./user-edit.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class UserEditComponent implements OnInit, OnDestroy {
  // Public
  public url = this.router.url;
  public urlLastValue;
  public rows;
  public currentRow;
  public tempRow;
  public avatarImage: string;
  public selectedRole = [];
  public selectRole = [];
  public roles: any[] = [];
  public selectStatus: any = [];
  public selectedFile: File | null = null;
  username: any;
  id: any;
  user: any;
  imageUrl: any;
  idImage: any;
  userId: any;
  submitted = false;
  loading = false;

  @ViewChild("accountForm") accountForm: NgForm;

  public birthDateOptions: FlatpickrOptions = {
    altInput: true,
  };

  public selectMultiLanguages = [
    "English",
    "Spanish",
    "French",
    "Russian",
    "German",
    "Arabic",
    "Sanskrit",
  ];
  public selectMultiLanguagesSelected = [];

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {Router} router
   * @param {UserEditService} _userEditService
   */
  constructor(
    private activatedRoute: ActivatedRoute,
    private _httpClient: HttpClient,
    private router: Router,
    private _userEditService: UserEditService,
    private _roleService: RoleService,
    private _userService: UserService
  ) {
    this._unsubscribeAll = new Subject();
    this.urlLastValue = this.url.substr(this.url.lastIndexOf("/") + 1);
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Reset Form With Default Values
   */
  resetFormWithDefaultValues() {
    this.accountForm.resetForm(this.tempRow);
  }

  /**
   * Upload Image
   *
   * @param event
   */
  uploadImage(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.previewImage(this.selectedFile);
    } else {
      console.error("No file selected or files array is empty.");
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.avatarImage = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadSelectedImage(file: File) {}

  onSubmit(user: User): void {
    const formData = new FormData();
    formData.append(
      "user",
      new Blob([JSON.stringify(user)], { type: "application/json" })
    );
    if (this.selectedFile) {
      formData.append("image", this.selectedFile, this.selectedFile.name);
    }
    this.loading = true;
    this._userService.updateUser(formData, user.idUser).subscribe(
      (response) => {
        this.loading = false;
        console.log("User updated successfully:", response);
        this.router.navigate(["/apps/user/user-list"]);
      },
      (error) => {
        this.loading = false;
        console.error("Error updating user:", error);
      }
    );
  }

  ngOnInit(): void {
    this._userEditService.onUserEditChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        if (Array.isArray(response)) {
          this.rows = response;

          this.findAndSetCurrentRow();
        } else if (typeof response === "object") {
          this.rows = [response]; // Wrap the object in an array

          this.findAndSetCurrentRow();
          // this.uploadImage(event);
        } else {
          console.error("Unexpected response format:", response);
        }
      });
    // Récupérer la liste des rôles
    this._roleService.getRoles().subscribe((roles) => {
      this.roles = [
        { name: "All", value: "" },
        ...roles.map((role) => ({ name: role.roleName, value: role.roleName })),
      ].filter(
        (role, index, self) =>
          index ===
          self.findIndex((r) => r.name === role.name && r.value === role.value)
      );
    });
    // Récupérer la liste des états enabled
    this._userService.getStutus().subscribe((enabled) => {
      // Assurez-vous de stocker la liste des états enabled dans selectStatus
      this.selectStatus = [
        { name: "All", value: "" },
        { name: "Active", value: true },
        { name: "Inactive", value: false },
      ];
    });
  }

  private findAndSetCurrentRow(): void {
    this.rows.map((row) => {
      if (row.entity.idUser == this.urlLastValue) {
        this.currentRow = row;
        this.avatarImage = this.currentRow.entity.image.imagenUrl;
        this.tempRow = cloneDeep(row);
      }
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
