import { Component } from '@angular/core';
import dataset from "./dataset_3.9.json"; // this is generated from running /Dfam-umbrella/Server/partition/scripts/getLeaderBoardData.py and hand editing the json

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
