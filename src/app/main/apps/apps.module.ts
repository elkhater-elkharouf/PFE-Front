import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { FullCalendarModule } from "@fullcalendar/angular";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { NgSelectModule } from "@ng-select/ng-select";
import { UserModule } from "./user/user.module";

// routing
const routes: Routes = [
  {
    path: "email",
    loadChildren: () =>
      import("./email/email.module").then((m) => m.EmailModule),
  },
  {
    path: "chat",
    loadChildren: () => import("./chat/chat.module").then((m) => m.ChatModule),
  },
  {
    path: "todo",
    loadChildren: () => import("./todo/todo.module").then((m) => m.TodoModule),
  },
  {
    path: "exports",
    loadChildren: () => import("./todo/todo.module").then((m) => m.TodoModule),
  },

  {
    path: "calendar",
    loadChildren: () =>
      import("./calendar/calendar.module").then((m) => m.CalendarModule),
  },
  {
    path: "invoice",
    loadChildren: () =>
      import("./invoice/invoice.module").then((m) => m.InvoiceModule),
  },
  {
    path: "e-commerce",
    loadChildren: () =>
      import("./ecommerce/ecommerce.module").then((m) => m.EcommerceModule),
  },
  {
    path: "user",
    loadChildren: () => import("./user/user.module").then((m) => m.UserModule),
  },
];

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
]);

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    ReactiveFormsModule,
  ],
})
export class AppsModule {}
