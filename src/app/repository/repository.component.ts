import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfam-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {

  repositories = [
    {
      name: "Collared Flycatcher TE Library",
      uploadDate: "Wed Nov 8 2017 9:26 AM",
      description: "TE Library developed by Alexander Suh for the" +
                   " Collared Flycatcher (Ficedula albicollis).",
      files: [
        { name: "fAlb15_rm3.0.xlsx.gz", path: "8/2017/11/16097-fAlb15_rm3.0.xlsx.gz", size: 13369 },
        { name: "fAlb15_rm3.0.lib.gz", path: "8/2017/11/68015-fAlb15_rm3.0.lib.gz", size: 19387 },
        { name: "collared_flycatcher_seed_alignments-3.0.tar.gz", path: "8/2017/11/2556027-collared_flycatcher_seed_alignments-3.0.tar.gz", size: 2556027 },
      ],
    },
    {
      name: "Malayan Flying Lemur RepeatModeler Output",
      uploadDate: "Thu Apr 6 2017 10:58 AM",
      description: "The raw output (consensus sequences and seed alignments) for a" +
                   " RepeatModeler run on the Malayan Flying Lemur genome" +
                   " (ucsc:galVar1 - G_variegatus-3.0.2). This is an un-curated library.",
      files: [
        { name: "4558156-galVar1-RepeatModeler-output.tar.gz",
          path: "8/2017/4/4558156-galVar1-RepeatModeler-output.tar.gz", size: 4558156 },
      ],
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
