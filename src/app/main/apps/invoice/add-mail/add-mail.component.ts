import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-add-mail',
  templateUrl: './add-mail.component.html',
  styleUrls: ['./add-mail.component.scss']
})
export class AddMailComponent implements OnInit {
  form: FormGroup;

  constructor( private fb: FormBuilder,
    private _userService: UserService,
    
    private dialog: DialogRef<AddMailComponent>,
    public toast: ToastrService  
  ) { }

  ngOnInit(): void {

    this.form = this.fb.group({
      host: ["", Validators.required],
      port: ["", Validators.required],
      username: [null, Validators.required],
      password: [null, Validators.required],
    
    });
  }

  onSubmit() {
    console.log(this.form.value);
    this._userService.addMail(this.form.value).subscribe({
      next: (res: any) => {
        this.dialog.close(res);
        this.toast.success("le mail a été ajouté avec succès");
      },
    });
  }

}
