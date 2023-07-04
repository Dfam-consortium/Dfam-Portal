import { Component, OnInit, Inject } from '@angular/core';

import { UntypedFormControl } from '@angular/forms';

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

  classificationSearch = new UntypedFormControl('');

  rootNode: Classification;

  classificationTreeDataSource = new MatTreeNestedDataSource<Classification>();
  classificationTreeControl = new NestedTreeControl<Classification>(node => node.children);
  hiddenNodes: { [index: number]: boolean } = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<FamilyClassificationDialogComponent>,
  ) {
    this.rootNode = data.rootNode as Classification;
    this.classificationTreeDataSource.data = this.rootNode.children;
  }

  ngOnInit() {
  }

  classificationNodeHasChild(index, node: Classification) {
    return !!node.children && node.children.length > 0;
  }

  isHidden(node: Classification) {
    return this.hiddenNodes[node.id] || false;
  }

  filterTree() {
    const search = this.classificationSearch.value.toLowerCase();

    const control = this.classificationTreeControl;

    function recurse_unhide(node: Classification, self: any) {
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          recurse_unhide(node.children[i], self);
        }
      }

      self.hiddenNodes[node.id] = false;
    }

    function recurse(node: Classification, self: any) {
      let found = false;

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (recurse(node.children[i], self)) {
            control.expand(node);
            found = true;
          }
        }
      }

      if (node.name.toLowerCase().indexOf(search) !== -1) {
        found = true;
        recurse_unhide(node, self);
      }

      if (node.aliases && node.aliases.toLowerCase().indexOf(search) !== -1) {
        found = true;
        recurse_unhide(node, self);
      }

      if (!found) {
        self.hiddenNodes[node.id] = true;
      }

      return found;
    }

    this.classificationTreeControl.collapseAll();
    this.hiddenNodes = {};
    if (search) {
      recurse(this.rootNode, this);
    }
  }

  displayNameWithHighlight(node: Classification): string {
    const search = this.classificationSearch.value;

    let name_markup = node.name;
    if (node.aliases) {
      name_markup = `${name_markup} [${node.aliases}]`;
    }

    // escape HTML special chars
    name_markup = name_markup.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

    if (!search) {
      return name_markup;
    }

    // escape HTML in search term
    const search_markup = search.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

    const search_regex = new RegExp(search_markup, 'i');
    return name_markup.replace(search_regex, '<strong>$&</strong>');
  }

  chooseClassification(id: number) {
    this.dialogRef.close(id);
  }

}
