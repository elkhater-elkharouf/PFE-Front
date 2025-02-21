import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NouisliderModule } from 'ng2-nouislider';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';

import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule } from '@core/components';
import { CoreTouchspinModule } from '@core/components/core-touchspin/core-touchspin.module';

import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { EcommerceService } from 'app/main/apps/ecommerce/ecommerce.service';
import { EcommerceDetailsComponent } from 'app/main/apps/ecommerce/ecommerce-details/ecommerce-details.component';
import { EcommerceItemComponent } from 'app/main/apps/ecommerce/ecommerce-item/ecommerce-item.component';
import { EcommerceShopComponent } from 'app/main/apps/ecommerce/ecommerce-shop/ecommerce-shop.component';
import { EcommerceSidebarComponent } from 'app/main/apps/ecommerce/ecommerce-shop/sidebar/sidebar.component';
import { EcommerceWishlistComponent } from 'app/main/apps/ecommerce/ecommerce-wishlist/ecommerce-wishlist.component';
import { EcommerceCheckoutComponent } from 'app/main/apps/ecommerce/ecommerce-checkout/ecommerce-checkout.component';
import { EcommerceCheckoutItemComponent } from 'app/main/apps/ecommerce/ecommerce-checkout/ecommerce-checkout-item/ecommerce-checkout-item.component';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatatablesService } from 'app/main/tables/datatables/datatables.service';
import { UserModule } from '../user/user.module';
import { UserListService } from '../user/user-list/user-list.service';
import { UserViewService } from '../user/user-view/user-view.service';
import { UserEditService } from '../user/user-edit/user-edit.service';
import { UserListComponent } from '../user/user-list/user-list.component';
import { NgSelectModule } from '@ng-select/ng-select';


const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  observer: true
};

// routing
const routes: Routes = [
  {
    path: 'shop',
    component: EcommerceShopComponent,
    resolve: {
      ecommerce: EcommerceService
    },
    data: { animation: 'EcommerceShopComponent' }
  },
  {
    path: 'details/:id',
    component: EcommerceDetailsComponent,
    resolve: {
      ecommerce: EcommerceService
    },
    data: { animation: 'EcommerceDetailsComponent' }
  },
  {
    path: 'wishlist',
    component: EcommerceWishlistComponent,
    resolve: {
      ecommerce: EcommerceService
    },
    data: { animation: 'EcommerceWishlistComponent' }
  },
  {
    path: 'checkout',
    component: EcommerceCheckoutComponent,
    resolve: {
      ecommerce: EcommerceService
    },
    data: { animation: 'EcommerceCheckoutComponent' }
  },
  {
    path: 'details',
    redirectTo: '/apps/e-commerce/details/27', //Redirection
    data: { animation: 'EcommerceDetailsComponent' }
  }
];

@NgModule({
  declarations: [
    EcommerceShopComponent,
    EcommerceSidebarComponent,
    EcommerceDetailsComponent,
    EcommerceWishlistComponent,
    EcommerceCheckoutComponent,
    EcommerceItemComponent,
    EcommerceCheckoutItemComponent,
  
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SwiperModule,
    FormsModule,
    ReactiveFormsModule,
    CoreTouchspinModule,
    ContentHeaderModule,
    CoreSidebarModule,
    CoreCommonModule,
    NgbModule,
    NouisliderModule,
    NgxDatatableModule,
    Ng2FlatpickrModule,
    NgSelectModule,
    UserModule
  ],
  
  providers: [
    DatatablesService,  {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    } ,
  ]
})
export class EcommerceModule {}
