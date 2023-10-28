import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dfam-chart-wrapper',
    templateUrl: './chart_wrapper.component.html',
    styleUrls: ['./chart_wrapper.component.scss']
  })
export class ChartWrapperComponent implements OnInit {
    
    datasets: object = {
        'uncurated': [
            { group : "Mammalia", count : 240940},
            { group : "Birds", count : 205910},
            { group : "Reptiles", count : 145365},
            { group : "Amphibians", count : 46715},
            { group : "Fish", count : 788964},
            { group : "Plants", count : 176667},
            { group : "Echinoderms", count : 9256},
            { group : "Protostomes", count : 1951101},
            { group : "Fungi", count : 43},
            { group : "Other", count : 9106},
          ],
          'curated': [
            { group : "Mammalia", count : 240940},
            { group : "Birds", count : 205910},
            { group : "Reptiles", count : 145365},
            { group : "Amphibians", count : 46715},
            { group : "Fish", count : 788964},
            { group : "Plants", count : 176667},
            { group : "Echinoderms", count : 9256},
            { group : "Protostomes", count : 43},
            { group : "Fungi", count : 1951101},
            { group : "Other", count : 9106},
          ]
    }

    specs = {
        margin : 20,
        dimension: 300,
    }

    ngOnInit(): void {
    }
}