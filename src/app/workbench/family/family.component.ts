import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';

import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Classification } from '../../shared/dfam-api/types';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';


import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

@Component({
  selector: 'dfam-workbench-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class WorkbenchFamilyComponent implements OnInit {
  family;

  allClassificationsSubject = new ReplaySubject<Classification[]>(1);

  saving = false;

  familyForm = this.fb.group({
    title: [''],
    description: [''],
    classification_id: 0,
    curation_state_name: '',
    disabled: false,
    target_site_cons: [''],
    curation_notes: [''],
    author: [''],
    aliases: this.fb.array([]),
    citations: this.fb.array([]),
    clades: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private dfambackendapi: DfamBackendAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getFamily();
    this.getClassifications();
  }

  addAlias() {
    const aliasesArray = this.familyForm.controls.aliases as FormArray;
    aliasesArray.push(this.fb.group({ database: '', alias: '', comment: '', deprecated: false }));
  }

  addCitation() {
    const citationsArray = this.familyForm.controls.citations as FormArray;
    citationsArray.push(this.fb.group({ pmid: null, comment: '' }));
  }

  addClade() {
    const cladesArray = this.familyForm.controls.clades as FormArray;
    cladesArray.push(this.fb.control(null));
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfambackendapi.getFamily(accession).subscribe(data => {
      this.family = data;

      const controls = this.familyForm.controls;

      controls.title.setValue(this.family.title);
      controls.description.setValue(this.family.description);

      controls.classification_id.setValue(this.family.classification_id);
      controls.curation_state_name.setValue(this.family.curation_state_name);
      controls.disabled.setValue(this.family.disabled);
      controls.target_site_cons.setValue(this.family.target_site_cons);
      controls.curation_notes.setValue(this.family.curation_notes);
      controls.author.setValue(this.family.author);

      const aliasesArray = controls.aliases as FormArray;
      aliasesArray.clear();
      this.family.aliases.forEach(a => {
        aliasesArray.push(this.fb.group({ database: a.database, alias: a.alias, comment: a.comment, deprecated: a.deprecated }));
      });

      const citationsArray = controls.citations as FormArray;
      citationsArray.clear();
      this.family.citations.forEach(c => {
        citationsArray.push(this.fb.group({ pmid: c.pmid, comment: c.comment }));
      });

      const cladesArray = controls.clades as FormArray;
      cladesArray.clear();
      this.family.clade_ids.forEach(id => {
        cladesArray.push(this.fb.control(id));
      });
    });
  }

  getClassifications() {
    this.dfambackendapi.getClasses().subscribe(root => {
      const flatten = function(node) {
        let flattened = [node];
        if (node.children) {
          node.children.map(flatten).forEach(child => flattened = flattened.concat(child));
        }
        return flattened;
      };

      const flattened = flatten(root);
      this.allClassificationsSubject.next(flattened);

      this.classificationTreeDataSource.data = (<Classification>root).children;
    });
  }

  saveFamily() {
    if (this.saving) {
      return;
    }
    this.saving = true;

    // NB: We do a manul diff here instead of checking control.dirty: That
    // approach will give false updates if edits are undone before submitting.

    const old = this.family;
    const controls = this.familyForm.controls;

    const changeset: any = {};

    function copyIfChanged(field: string, controlField?: string) {
      controlField = controlField || field;
      if (old[field] !== controls[controlField].value) {
        changeset[field] = controls[controlField].value;
      }
    }

    copyIfChanged("title");
    copyIfChanged("description");
    copyIfChanged("classification_id");
    copyIfChanged("curation_state_name");
    copyIfChanged("disabled");
    copyIfChanged("target_site_cons");
    copyIfChanged("curation_notes");
    copyIfChanged("author");

    // Change checking aliases is a bit tricky. First, we convert
    // the form values back to objects. Then, we check the number
    // of aliases. Finally, we walk through one by one. If anything
    // doesn't match up exactly, we assume all aliases need
    // to be sent to the server.

    const aliasesArray = controls.aliases as FormArray;
    const aliasObjs = (<FormGroup[]>aliasesArray.controls).map(a => {
      const controls = < { [key: string]: FormControl }>(a.controls);
      return {
        database: controls['database'].value,
        alias: controls['alias'].value,
        comment: controls['comment'].value || '',
        deprecated: controls['deprecated'].value,
      };
    });

    let aliasesChanged = false;
    if (aliasObjs.length === old.aliases.length) {
      const aliasFieldChanged = function(i, field) {
        return aliasObjs[i][field] != old.aliases[i][field];
      };

      for (let i = 0; i < aliasObjs.length; i++) {
        if (
            aliasFieldChanged(i, "database") ||
            aliasFieldChanged(i, "alias") ||
            aliasFieldChanged(i, "comment") ||
            aliasFieldChanged(i, "deprecated")
        ) {
          aliasesChanged = true;
          break;
        }
      }
    } else {
      aliasesChanged = true;
    }

    if (aliasesChanged) {
      changeset.aliases = aliasObjs;
    }

    // Same with citations as with aliases

    const citationsArray = controls.citations as FormArray;
    const citationObjs = (<FormGroup[]>citationsArray.controls).map(c => {
      const controls = < { [key: string]: FormControl }>(c.controls);
      return {
        pmid: controls['pmid'].value,
        comment: controls['comment'].value || '',
      };
    });

    let citationsChanged = false;
    if (citationObjs.length === old.citations.length) {
      const citationFieldChanged = function(i, field) {
        return citationObjs[i][field] != old.citations[i][field];
      };

      for (let i = 0; i < citationObjs.length; i++) {
        if (
            citationFieldChanged(i, "pmid") ||
            citationFieldChanged(i, "comment")
        ) {
          citationsChanged = true;
          break;
        }
      }
    } else {
      citationsChanged = true;
    }

    if (citationsChanged) {
      changeset.citations = citationObjs;
    }

    // And the same with clades, which is a bit easier because
    // it's just the one field.

    const cladesArray = controls.clades as FormArray;
    const cladeVals = (<FormGroup[]>cladesArray.controls).map(c => parseInt(c.value));

    let cladesChanged = false;
    if (cladeVals.length === old.clade_ids.length) {
      for (let i = 0; i < cladeVals.length; i++) {
        if (cladeVals[i] != old.clade_ids[i]) {
          cladesChanged = true;
          break;
        }
      }
    } else {
      cladesChanged = true;
    }

    if (cladesChanged) {
      changeset.clade_ids = cladeVals;
    }

    // Finally, send the patch request.

    this.dfambackendapi.patchFamily(this.family.accession, changeset).subscribe(r => {
      this.saving = false;
    });
  }

  displayClassById(id: number): Observable<string> {
    return this.allClassificationsSubject.pipe(map(clss => {
      const cls = clss.find(c => c.id == id);
      if (cls) {
        return cls.full_name;
      } else {
        return "<Unknown>";
      }
    }));
  }


  isPickingClassification = false;

  pickClassification() {
    this.isPickingClassification = true;
  }

  chooseClassification(id: number) {
    this.familyForm.controls.classification_id.setValue(id);
    this.isPickingClassification = false;
  }

  classificationTreeDataSource = new MatTreeNestedDataSource<Classification>();
  classificationTreeControl = new NestedTreeControl<Classification>(node => node.children);

  classificationNodeHasChild(index, node: Classification) {
    return !!node.children && node.children.length > 0;
  }
}
