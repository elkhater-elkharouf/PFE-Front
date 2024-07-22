import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ColumnMode, DatatableComponent } from "@swimlane/ngx-datatable";

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { CoreConfigService } from "@core/services/config.service";
import { CoreSidebarService } from "@core/components/core-sidebar/core-sidebar.service";

import { UserListService } from "app/main/apps/user/user-list/user-list.service";
import { RoleService } from "services/role.service";
import { Role } from "models/role";
import { UserService } from "services/user.service";

@Component({
  selector: "app-user-list",
  templateUrl: "./user-list.component.html",
  styleUrls: ["./user-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class UserListComponent implements OnInit {
  public pageAdvancedEllipses = 1;
  public selectedOption = 2;
  public collectionSize = 0;
  public totalPages = 0;
  // Public
  public sidebarToggleRef = false;
  public rows;

  public ColumnMode = ColumnMode;
  public temp = [];
  public previousRoleFilter = "";
  public previousDepartmentFilter = "";
  public previousStatusFilter = "";

  public selectRole: any = [];

  public selectDepartment: any = [];

  public selectStatus: any = [
    { name: "All", value: "" },
    { name: "Pending", value: "Pending" },
    { name: "Active", value: "Active" },
    { name: "Inactive", value: "Inactive" },
  ];

  public selectedRole = [];
  public selectedDepartment = [];
  public selectedStatus = [];
  public searchValue = "";

  // Decorator
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // Private
  private tempData = [];
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {UserListService} _userListService
   * @param {CoreSidebarService} _coreSidebarService
   */
  constructor(
    private _userListService: UserListService,
    private _coreSidebarService: CoreSidebarService,
    private _coreConfigService: CoreConfigService,
    private _roleService: RoleService,
    private _userService: UserService
  ) {
    this._unsubscribeAll = new Subject();
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    // Reset ng-select on search
    this.selectedRole = this.selectRole[0];
    this.selectedDepartment = this.selectDepartment[0];
    this.selectedStatus = this.selectStatus[0];

    const val = event.target.value.toLowerCase();

    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.fname.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Update The Rows
    this.rows = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name): void {
    this._coreSidebarService.getSidebarRegistry(name).toggleOpen();
  }

  /**
   * Filter By Roles
   *
   * @param event
   */
  filterByRole(event) {
    const selectedRole = event ? event.value : "";
    
    // Set selectedRole to empty string if "All" is selected to retrieve all users
    if (selectedRole === "All") {
      this.loadUsers();
    } else {
      this.selectedRole = selectedRole;
      this._userService.getUsersByRole(this.selectedRole.toString()).subscribe(
        (users) => {
          this.tempData = users;
          this.temp = this.filterRows(
            selectedRole,
            this.previousDepartmentFilter,
            this.previousStatusFilter
          );
          this.rows = this.temp;
        },
        (error) => {
          console.error('Error fetching users by role', error);
          // Gérer l'erreur ou afficher un message à l'utilisateur
        }
      );
    }
  }

  /**
   * Filter By Plan
   *
   * @param event
   */
  filterByDepartment(event) {
    const selectedDepartment = event ? event.value : "";
    
    // Set selectedDepartment to empty string if "All" is selected to retrieve all users
    if (selectedDepartment === "All") {
      this.loadUsers();
    } else {
      this.previousDepartmentFilter = selectedDepartment;
      this._userService.getUsersByDepartment(selectedDepartment).subscribe(
        (users) => {
          this.tempData = users;
          this.temp = this.filterRows(
            this.previousRoleFilter,
            selectedDepartment,
            this.previousStatusFilter
          );
          this.rows = this.temp;
        },
        (error) => {
          console.error('Error fetching users by department', error);
          // Handle error or show message to user
        }
      );
    }
  }


  /**
   * Filter By Status
   *
   * @param event
   */
  filterByStatus(event) {
    const selectedStatus = event ? event.value : "";
    this.previousStatusFilter = selectedStatus;
  
    // Convert selectedStatus to a boolean for active/inactive
    const isActive = selectedStatus === "Active" ? true : selectedStatus === "Inactive" ? false : null;
  
    // Call your service method to fetch users by status if a valid status is selected
    if (isActive !== null) {
      this._userService.getUsersByStatus(isActive).subscribe(
        (users) => {
          this.tempData = users;
          this.temp = this.filterRows(
            this.previousRoleFilter,
            this.previousDepartmentFilter,
            selectedStatus
          );
          this.rows = this.temp;
        },
        (error) => {
          console.error('Error fetching users by status', error);
          // Handle error or show message to user
        }
      );
    } else {
      // If 'All' or invalid status is selected, fetch all users
      this.loadUsers();
    }
  }
  

  /**
   * Filter Rows
   *
   * @param roleFilter
   * @param departmentFilter
   * @param statusFilter
   */
  filterRows(roleFilter, departmentFilter, statusFilter): any[] {
    // Reset search on select change
    this.searchValue = "";

    roleFilter = roleFilter ? roleFilter.toLowerCase() : "";
    departmentFilter = departmentFilter ? departmentFilter.toLowerCase() : "";
    statusFilter = statusFilter ? statusFilter.toLowerCase() : "";

    return this.tempData.filter((row) => {
      const isPartialNameMatch =
        (row.role &&
          row.role.roleName &&
          row.role.roleName.toLowerCase().indexOf(roleFilter) !== -1) ||
        !roleFilter;
      const isPartialDepartmentMatch =
        (row.department &&
          row.department.toLowerCase().indexOf(departmentFilter) !== -1) ||
        !departmentFilter;
        const isActive = row.enabled == 1; // Assuming 1 represents active
        const isInactive = row.enabled == 0; // Assuming anything other than 1 represents inactive
        const isActiveMatch = (statusFilter === 'active' && isActive) || !statusFilter;
        const isInactiveMatch = (statusFilter === 'inactive' && isInactive) || !statusFilter;
    
        return (
          isPartialNameMatch &&
          isPartialDepartmentMatch &&
          (isActiveMatch || isInactiveMatch)
        );
      });
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        if (config.layout.animation === "zoomIn") {
          setTimeout(() => {
            this.loadUsers();
          }, 450);
        } else {
          this.loadUsers();
        }
      });
    // Récupérer la liste des rôles
    this._roleService.getRoles().subscribe((roles) => {
      this.selectRole = [
        { name: "All", value: "" },
        ...roles.map((role) => ({ name: role.roleName, value: role.roleName })),
      ].filter(
        (role, index, self) =>
          index ===
          self.findIndex((r) => r.name === role.name && r.value === role.value)
      );
    });
    // Récupérer la liste des départements
    this._userService.getDepartments().subscribe((departments) => {
      // Assurez-vous de stocker la liste des départements dans selectDepartment
      this.selectDepartment = [
        { name: "All", value: "" },
        ...departments.map((department) => ({
          name: department,
          value: department,
        })),
      ];
    });

    // Récupérer la liste des départements
    this._userService.getStutus().subscribe((enabled) => {
      // Assurez-vous de stocker la liste des départements dans selectDepartment
      this.selectStatus = [
        { name: "All", value: "" },
        ...enabled.map((enabled) => ({ name: enabled, value: enabled })),
      ];
    });
  }
  loadUsers() {
    this._userListService
      .getDataTableRows(this.pageAdvancedEllipses - 1, this.selectedOption, "idUser,asc")
      .then((response) => {
        if (response && response.content) {
          this.rows = response.content;
          this.collectionSize = response.totalElements;
          this.totalPages = response.totalPages;
          this.tempData = this.rows;
        } else {
          console.error("Invalid data format received", response);
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

  deleteUser(id: number) {
    if (window.confirm("Confirmer la supression")) {
      this._userService.deleteUser(id).subscribe(
        (data) => {
          alert("suppresion avec succès");
          location.reload();
        },
        (error) => {
          alert("suppression erronée");
          console.log(error);
        }
      );
    }
  }
}
