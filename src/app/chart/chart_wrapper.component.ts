import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dfam-chart-wrapper',
    templateUrl: './chart_wrapper.component.html',
    styleUrls: ['./chart_wrapper.component.scss']
  })
export class ChartWrapperComponent implements OnInit {
    
    datasets = {
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
            { group : "ASFAFS", count : 7964},
            { group : "AFSFASF", count : 17667},
            { group : "Protostomes", count : 43},
            { group : "ASgsfgbds", count : 195101},
            { group : "Mammalia", count : 240940},
            { group : "Birds", count : 205910},
            { group : "Reptiles", count : 14565},
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
