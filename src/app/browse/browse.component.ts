import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: '',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent {
  title = 'Browse Dfam';
  navigationSubscription;
  totalEntriesMsg = "";
  families:any = [];
  prefixes:any = ["A", "B", "C", "D", "E", "F", "G", "H", 
                  "I", "J", "K", "L", "M", "N", "O", "P",
                  "Q", "R", "S", "T", "U", "V", "W", "X", 
                  "Y", "Z", "0", "1", "2", "3", "4", "5",
                  "6", "7", "8", "9"];

  constructor(public dfamapi:DfamAPIService, private route: ActivatedRoute, private router: Router) { 

     this.navigationSubscription = this.router.events.subscribe((e: any) => {
       // If it is a NavigationEnd event re-initalise the component
       if (e instanceof NavigationEnd) {
         this.getFamilies();
       }
     });
  
  }

  ngOnInit() {
    this.getFamilies();
  }

  getFamilies() {
    this.families = [];
    let prefix = "A";
    if ( this.route.snapshot.params['prefix'] )
      prefix = this.route.snapshot.params['prefix'];
    
    this.dfamapi.getFamilies(prefix).subscribe((data: {}) => {
      this.families = data;
      if ( "totalHits" in data )
        this.totalEntriesMsg = data['totalHits'] + " entries beginning with " + prefix;
    });
  }
  
}
