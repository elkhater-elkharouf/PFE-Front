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
  // Public
  public sidebarToggleRef = false;
  public rows;
  public selectedOption = 10;
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
    const filter = event ? event.value : "";
    this.previousRoleFilter = filter;
    this.temp = this.filterRows(
      filter,
      this.previousDepartmentFilter,
      this.previousStatusFilter
    );
    this.rows = this.temp;
  }

  /**
   * Filter By Plan
   *
   * @param event
   */
  filterByDepartment(event) {
    const filter = event ? event.value : "";
    this.previousDepartmentFilter = filter;
    this.temp = this.filterRows(
      this.previousRoleFilter,
      filter,
      this.previousStatusFilter
    );
    this.rows = this.temp;
  }

  /**
   * Filter By Status
   *
   * @param event
   */
  filterByStatus(event) {
    const filter = event ? event.value : "";
    this.previousStatusFilter = filter;
    this.temp = this.filterRows(
      this.previousRoleFilter,
      this.previousDepartmentFilter,
      filter
    );
    this.rows = this.temp;
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
    // Subscribe config change
    this._coreConfigService.config
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        //! If we have zoomIn route Transition then load datatable after 450ms(Transition will finish in 400ms)
        if (config.layout.animation === "zoomIn") {
          setTimeout(() => {
            this._userListService.onUserListChanged
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((response) => {
                console.log(response);
                this.rows = response;
                this.tempData = this.rows;
              });
          }, 450);
        } else {
          this._userListService.onUserListChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
              console.log(response);
              this.rows = response;
              this.tempData = this.rows;
            });
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
