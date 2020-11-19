import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamBackendAPIService } from '../shared/dfam-api/dfam-backend-api.service';

@Component({
  selector: 'dfam-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  message = 'Verifying your account...';

  constructor(
    private dfamBackendAPIService: DfamBackendAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.verify(this.route.snapshot.queryParams['token']);
  }

  verify(token) {
    this.dfamBackendAPIService.verify(token).subscribe(data => {
      this.message = 'Thank you for verifying your email address! Your account has been enabled for login.';
    }, response => {
      if (response.status === 400 && response.error.message) {
        // If it was a 400 (client error), display the message.
        this.message = 'Error: ' + response.error.message;
      } else {
        // Unknown error
        this.message = 'An unknown error occurred. Please try again later.';
      }
    });
  }

}
