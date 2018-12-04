import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ClassificationTreeComponent } from './classification-tree.component';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'app-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.scss']
})
export class ClassificationComponent implements OnInit {

  @ViewChild('classificationTree') classificationTree: ClassificationTreeComponent;

  classes: any;
  tsv: string;

  searchInput: string;

  searchInputUpdates = new Subject<string>();
  set liveSearchInput(value: string) {
    this.searchInputUpdates.next(value);
  }

  constructor(private dfamapi: DfamAPIService) { }

  ngOnInit() {
    this.getClassificationData();
    this.searchInputUpdates.pipe(
      debounceTime(300)
    ).subscribe(input => this.searchInput = input);
  }

  getClassificationData() {
    this.dfamapi.getClasses().subscribe(data => {
      if (!data) {
        return;
      }

      this.classes = data;

      let tsvFields = [ 'full_name', 'title', 'description', 'hyperlink',
        'count', 'repeatmasker_type', 'repeatmasker_subtype', 'repbase_equiv',
        'wicker_equiv', 'curcio_derbyshire_equiv', 'piegu_equiv' ];

      let tsv = tsvFields.join('\t') + '\n';

      function appendWithChildren(node) {
        tsv += tsvFields.map(function(fieldName) {
          let value = node[fieldName] || '';

          if (fieldName === 'full_name') {
            value = value.replace(/^root;/, '');
          }
          if (fieldName === 'title') {
            value = node['tooltip'] || '';
          }

          return value;
        }).join('\t');
        tsv += '\n';

        if (node.children) {
          node.children.forEach(appendWithChildren);
        }
      }

      data.children.forEach(appendWithChildren);

      this.tsv = tsv;
    });
  }

  onDownload() {
    if (this.tsv) {
      const blob = new Blob([this.tsv], { type: 'text/plain' });
      window.saveAs(blob, 'TEClasses.tsv');
    }
  }
}
