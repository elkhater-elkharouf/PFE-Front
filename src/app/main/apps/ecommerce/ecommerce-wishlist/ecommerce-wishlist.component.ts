import { AfterViewInit, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { EcommerceService } from 'app/main/apps/ecommerce/ecommerce.service';
import { Projet } from 'models/projet';
import { UserService } from 'services/user.service';

@Component({
  selector: 'app-ecommerce-wishlist',
  templateUrl: './ecommerce-wishlist.component.html',
  styleUrls: ['./ecommerce-wishlist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ecommerce-application' }
})
export class EcommerceWishlistComponent implements OnInit {
  // Public
  public contentHeader: object;
  public products;
  public wishlist;
  projets:Projet[]=[]
  /**
   *
   * @param {EcommerceService} _ecommerceService
   */
  constructor(private _ecommerceService: EcommerceService , private _userService : UserService, private elementRef: ElementRef) {}
  loadProjetData() {
    this._userService.getAllProjet().subscribe(
      (data: Projet[]) => {
        this.projets = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.loadProjetData();
   
  }
  exportUsers(projetId: number) {
    this._ecommerceService.exportUsersByProjetId(projetId).subscribe(
      (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      (error) => {
        console.error('Error exporting users:', error);
        // Handle error here
      }
    );
  }
}
