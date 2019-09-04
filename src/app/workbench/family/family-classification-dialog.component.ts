import { Component, OnInit, Inject } from '@angular/core';

import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Classification } from '../../shared/dfam-api/types';

@Component({
  selector: 'dfam-family-classification-dialog',
  templateUrl: './family-classification-dialog.component.html',
  styleUrls: ['./family-classification-dialog.component.scss']
})
export class FamilyClassificationDialogComponent implements OnInit {

  classificationTreeDataSource = new MatTreeNestedDataSource<Classification>();
  classificationTreeControl = new NestedTreeControl<Classification>(node => node.children);

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<FamilyClassificationDialogComponent>,
  ) {
    this.classificationTreeDataSource.data = (<Classification>data.rootNode).children;
  }

  ngOnInit() {
  }

  classificationNodeHasChild(index, node: Classification) {
    return !!node.children && node.children.length > 0;
  }

  chooseClassification(id: number) {
    this.dialogRef.close(id);
  }

}
