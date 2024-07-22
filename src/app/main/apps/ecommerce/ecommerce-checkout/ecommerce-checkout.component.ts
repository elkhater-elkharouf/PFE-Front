


import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import Stepper from 'bs-stepper';

import { EcommerceService } from 'app/main/apps/ecommerce/ecommerce.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Projet } from 'models/projet';
import { ColumnMode, DatatableComponent, SelectionType } from "@swimlane/ngx-datatable";
import { takeUntil } from 'rxjs/operators';
import { DatatablesService } from 'app/main/tables/datatables/datatables.service';
import { Subject } from 'rxjs';
import { User } from 'app/auth/models';
import { UserListComponent } from '../../user/user-list/user-list.component';
import * as $ from 'jquery';
@Component({
  selector: 'app-ecommerce-checkout',
  templateUrl: './ecommerce-checkout.component.html',
  styleUrls: ['./ecommerce-checkout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' },

})
export class EcommerceCheckoutComponent implements OnInit {
 // @ViewChild(DatatableComponent) table: DatatableComponent;
 @ViewChild('myTable') table: any;
  public loading = true ;
  private _unsubscribeAll: Subject<any> = new Subject();
  public exportCSVData: any[] = [];
  public projetForm : FormGroup;
  userForm:FormGroup;
  public addressForm : FormGroup
  public users: any[];
  public selectedUsers= [];
  public searchValue="";
  public rows// Initialisez rows avec un tableau vide
  private tempData= []; 
  public temp = [];
  public kitchenSinkRows: any[] = []; 
  public basicSelectedOption: number = 10;
  public SelectionType = SelectionType;
  // Public
  public contentHeader: object;
  public basicDPdata: NgbDateStruct;

  mail = {
    username: '',
    host: '',
    password: '',
    port: null
  };
  // Private
  private checkoutStepper: Stepper;
  // Decorator
  //@ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private fb: FormBuilder,private _datatablesService: DatatablesService,
    private _userService: UserService,
    private toastr: ToastrService) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Stepper Next
   */
  nextStep() {
    this.checkoutStepper.next();
  }
  /**
   * Stepper Previous
   */
  previousStep() {
    this.checkoutStepper.previous();
  }

  /**
   * Validate Next Step
   *
   * @param addressForm
   */
  validateNextStep(addressForm) {
    if (addressForm.valid) {
      this.nextStep();
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  toggleAllSelections(event) {
    const usersArray = this.userForm.get('userList') as FormArray;
    usersArray.controls.forEach(control => {
      (control as FormGroup).controls['selected'].setValue(event.target.checked);
    });
  }
  
  toggleUserSelection(user: User): void {
    console.log(user)

     if (!user.selected) {
      console.log(this.selectedUsers)
      this.selectedUsers.push(user);
      console.log(this.selectedUsers)
    } else {
      this.selectedUsers = this.selectedUsers.filter(
        (selectedUser) => selectedUser.idUser !== user.idUser
      );
      console.log(this.selectedUsers)
    } 
    //user.selected = !user.selected;
  }
  isSelected(user: User): boolean {
  /*   return this.selectedUsers.some(
      (selectedUser) =>selectedUser.idUser === user.idUser
    ); */
    return user.selected;
  }
  initializeForm(): void {

    this.projetForm = this.fb.group({
      nameProjet: ["", Validators.required],
      dateDeb: [null, Validators.required],
      status: ['', Validators.required],
      dateFin: [null, Validators.required],
     // mail: ["", Validators.required],
      //users: [[], Validators.required],
    });
    this.userForm = this.fb.group({
      searchValue: [''],
      selectedUsers: this.fb.array([]),
    });

    this.addressForm = this.fb.group({
      username: ['', Validators.required],
      host: ['', Validators.required],
      password: ['', Validators.required],
      port: ['', Validators.required]
    });
    
 
    if (this.users && Array.isArray(this.users)) {
      const userSelections = this.fb.group({}); // Créer un groupe de contrôles pour les sélections d'utilisateurs
  
      this.users.forEach(user => {
        userSelections.addControl(user.idUser.toString(), this.fb.control(false)); // Ajouter un contrôle pour chaque utilisateur
      });
  
      this.userForm.addControl('userSelections', userSelections); // Ajouter le groupe de contrôles au formulaire principal
      console.log(this.userForm)
    }

  }

  fetchUsers(): void {
    console.log("aaaaa")
    this.loading=true ; 
    this._userService.getUsers().subscribe(
      
      (data: any) => {
      console.log("data" ,data)
        this.users = data
        this.loading=false ; 
      },
      (error) => console.error("Error fetching users", error)
    );
  }
  onChange(value: number) {
    this.basicSelectedOption = value;
}
filterUpdate(event) {
   console.log('table:', this.table); // Vérifiez si table est défini
  console.log('this.tempData:', this.tempData); // Vérifiez la structure de this.tempData
  console.log('this.kitchenSinkRows:', this.kitchenSinkRows); // Vérifiez la structure de this.kitchenSinkRows
 
  const val = event.target.value.toLowerCase();

  // Filter our data based on 'fname'
  const temp = this.users.filter(user =>
    user.fname.toLowerCase().includes(val)
  );

  // Update the rows
  this.kitchenSinkRows = temp;

  // Check if 'table' is defined before accessing its properties
  
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  
    
}
  submit(): void {
    const selectedUserIds = this.getSelectedUserIds();
    console.log(selectedUserIds); 
    console.log(this.userForm.value)
    console.log("tytt", this.addressForm.value)

      const projetData = {
        nameProjet:this.projetForm.value.nameProjet,
          status:this.projetForm.value.status, 
          dateDeb:this.projetForm.value.dateDeb,
          dateFin:this.projetForm.value.dateFin,
            mail:{
              host: this.addressForm.value.host,
                port:this.addressForm.value.port,
                username:this.addressForm.value.username ,
                password:this.addressForm.value.password
               }
      };
      console.log("aaa",projetData)
      // Check if projetData.users is defined before using map
    
      
 
      this._userService.addProjetWithMailAndUsers(projetData, selectedUserIds).subscribe({
        next: (value) => {
          console.log("Projet ajouté avec succès :", value);
          this.toastr.success("Projet ajouté avec succès", "Notification");
          //this.projetForm.reset();
        },
        error: (err) => {
          console.error("Erreur lors de l'ajout du projet :", err);
          this.toastr.error("Erreur lors de l'ajout du projet", "Erreur");
        }
      });
      
      
    } 
  


  /**
   * On init
   */
  getSelectedUserIds(): number[] {
    return this.selectedUsers.map(user => user.idUser);
  }
  
  ngOnInit(): void {
    //this.initUserList();
    this.userForm = this.fb.group({
      searchValue: [''], 
      selectedUsers: this.fb.array([]),
      // Ajoutez les champs requis et leurs valeurs par défaut
    });
    this.addressForm = this.fb.group({
      username: ['', Validators.required],
      host: ['', Validators.required],
      password: ['', Validators.required],
      port: ['', Validators.required]
    });
    this._datatablesService.onDatatablessChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
      this.kitchenSinkRows = this.rows;
      this.exportCSVData = this.rows;
    });
    this.initializeForm();
    //this.fetchUsers();

    this.checkoutStepper = new Stepper(document.querySelector('#checkoutStepper'), {
      linear: false,
      animation: true
    });

 
  }
}
