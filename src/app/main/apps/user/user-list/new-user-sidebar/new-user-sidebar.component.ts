import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { CoreSidebarService } from "@core/components/core-sidebar/core-sidebar.service";
import { ToastrService } from "ngx-toastr";

import { UserService } from "services/user.service";

@Component({
  selector: "app-new-user-sidebar",
  templateUrl: "./new-user-sidebar.component.html",
})
export class NewUserSidebarComponent implements OnInit {
  public userForm!: FormGroup;
  public selectedFile: any;
  public avatarImage: any;
  public privileges: any[];
  public selectedPrivileges: any;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _coreSidebarService: CoreSidebarService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchPrivileges();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      fname: ["", Validators.required],
      lname: ["", Validators.required],
      department: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      role: ["", Validators.required],
      password: ["", Validators.required],
      privileges: [[], Validators.required],
    });
  }

  fetchPrivileges(): void {
    this._userService.getPrivileges().subscribe(
      (data: any) => {
        this.privileges = data;
      },
      (error) => console.error("Error fetching privileges", error)
    );
  }

  logSelected(): void {
    console.log(this.userForm.value.privileges);
  }

  uploadImage(event: Event): void {
    const element = event.target as HTMLInputElement;
    let file = element.files ? element.files[0] : null;
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.avatarImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  toggleSidebar(name: string): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  submit(): void {
    if (!this.userForm.valid) {
      alert("Please fill all required fields.");
      return;
    }

    const selectedPrivilegesObjects = this.userForm.value.privileges.map(
      (id) => {
        const privilege = this.privileges.find((p) => p.idPrivilege === id);
        return {
          idPrivilege: privilege.idPrivilege,
          privilegeName: privilege.privilegeName,
        };
      }
    );

    const user = {
      email: this.userForm.value.email,
      fname: this.userForm.value.fname,
      lname: this.userForm.value.lname,
      department: this.userForm.value.department,
      password: this.userForm.value.password,
   
      role: {
        roleName: this.userForm.value.role,
        etatrole: true,
        privileges: selectedPrivilegesObjects,
      },
    };

    this._userService.addUser(user).subscribe({
      next: (value) => {
        console.log("User added successfully:", value);
        this.toastr.success("User added successfully", "Notification");

        if(this.selectedFile){
          this._userService
          .uploadImage(this.selectedFile, value.entity.idUser)
          .subscribe({
            next: (value) => {
              console.log("Image uploaded successfully:", value);
            },
            error(err) {
              console.error("Error uploading image:", err);
            },
          });
        }
     
        this.toggleSidebar("new-user-sidebar");
        window.location.reload();
      },
      error(err) {
        console.error("Error adding user:", err);
      },
    });
  }
}
