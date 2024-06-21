import { DOCUMENT } from "@angular/common";
import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { EmailService } from "app/main/apps/email/email.service";

@Component({
  selector: "app-email",
  templateUrl: "./exports.component.html",
  encapsulation: ViewEncapsulation.None,
  host: { class: "email-application" },
})
export class ExportsComponent {
  /**
   *
   * @param {DOCUMENT} document
   * @param {ActivatedRoute} route
   * @param {EmailService} _emailService
   */
  constructor() {}

  ngOnInit(): void {}
}
