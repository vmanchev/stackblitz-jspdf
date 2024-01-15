import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { InvoiceService } from './invoice.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [InvoiceService],
  imports: [HttpClientModule],
  template: `
    <h1>Hello from {{ name }}!</h1>
    <button (click)="invoiceService.open()">open pdf</button>
  `,
})
export class AppComponent {
  name = 'Angular';

  constructor(protected invoiceService: InvoiceService) {}
}

bootstrapApplication(AppComponent);
