import { Component } from '@angular/core';
import dataset from "./dataset.json"; // This is data gathered using the Server/countFamilyContributors.py script

export interface PeriodicElement {
  name: string;
  count: number;
}

@Component({
  selector: 'dfam-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  displayedColumns: string[] = ['count', 'name']; // Column order is defined here. Row order is determined by JSON file order
  dataSource: PeriodicElement[] = dataset as PeriodicElement[];
}
