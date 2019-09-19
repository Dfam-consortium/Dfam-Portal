import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject, ReplaySubject } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

import { FamilyClassificationDialogComponent } from './family-classification-dialog.component';
import { Classification } from '../../shared/dfam-api/types';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';
import { ErrorsService } from '../../shared/services/errors.service';

function preg_quote( str ) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

    return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, '\\$1');
}


@Component({
  selector: 'dfam-workbench-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class WorkbenchFamilyComponent implements OnInit {
  family;

  rootClassificationSubject = new ReplaySubject<Classification>(1);
  allClassificationsSubject = new ReplaySubject<Classification[]>(1);

  cladeSearchTerm = new Subject<string>();
  cladeOptions: any[];

  curationStateOptions: any[];
  rmStageOptions: any[];

  saving = false;

  familyForm = this.fb.group({
    name: [''],
    title: [''],
    description: [''],
    classification_id: [0],
    curation_state_id: [''],
    disabled: [false],
    target_site_cons: [''],
    curation_notes: [''],
    author: [''],
    aliases: this.fb.array([]),
    citations: this.fb.array([]),
    clades: this.fb.array([]),
    search_stages: this.fb.array([]),
    buffer_stages: this.fb.array([]),
  });

  static validateClade(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return { 'required': { } };
    }

    // This is a somewhat roundabout way to check if a clade was actually
    // clicked - which results in value being a { id: ..., name: ... } object -
    // or just typed, which results in a string with no 'id' property.
    if (!control.value.hasOwnProperty('id')) {
      return { 'cladeNotConfirmed': { } };
    }

    return null;
  }

  constructor(
    private fb: FormBuilder,
    private dfambackendapi: DfamBackendAPIService,
    private dialog: MatDialog,
    private errorsService: ErrorsService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getFamily();
    this.getMetadata();
    this.getClassifications();

    this.cladeSearchTerm.pipe(debounceTime(300)).subscribe(search_term => {
      if (!search_term) {
        return;
      }

      // escape search_term so it will be found in the escaped markup
      const escaped_search_term = search_term.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

      this.dfambackendapi.getTaxa(search_term.trim()).subscribe(clades => {
        this.cladeOptions = clades.taxa.filter(f => f.name !== 'root');
        this.cladeOptions.forEach(c => {
          c.name_markup = c.name;
          // escape HTML special chars
          c.name_markup = c.name_markup.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

          c.name_markup = c.name_markup.replace(new RegExp(preg_quote(escaped_search_term), 'gi'), '<strong>$&</strong>');
        });
      });
    });

  }

  addAlias(data?) {
    const aliasesArray = this.familyForm.controls.aliases as FormArray;
    data = data || { database: '', alias: '', comment: '', deprecated: false };
    aliasesArray.push(this.fb.group({
      database: [data.database, Validators.required],
      alias: [data.alias, Validators.required],
      comment: [data.comment],
      deprecated: [data.deprecated],
    }));
  }

  addCitation(data?) {
    const citationsArray = this.familyForm.controls.citations as FormArray;
    data = data || { pmid: null, comment: '' };
    citationsArray.push(this.fb.group({
      pmid: [data.pmid, Validators.required],
      comment: [data.comment],
    }));
  }

  addClade(data?) {
    const cladesArray = this.familyForm.controls.clades as FormArray;
    data = data || null;
    cladesArray.push(this.fb.control(data, [WorkbenchFamilyComponent.validateClade]));
  }

  addSearchStage(data?) {
    const searchStagesArray = this.familyForm.controls.search_stages as FormArray;
    data = data || null;
    searchStagesArray.push(this.fb.control(data, Validators.required));
  }

  addBufferStage(data?) {
    const bufferStagesArray = this.familyForm.controls.buffer_stages as FormArray;
    data = data || { stage: null, start: 0, end: 0 };
    bufferStagesArray.push(this.fb.group({
      stage: [data.stage, Validators.required],
      start: [data.start],
      end: [data.end],
    }));
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfambackendapi.getFamily(accession).subscribe(data => {
      if (!data) {
        return;
      }

      this.family = data;

      const controls = this.familyForm.controls;

      controls.name.setValue(this.family.name);
      controls.title.setValue(this.family.title);
      controls.description.setValue(this.family.description);

      controls.classification_id.setValue(this.family.classification_id);
      controls.curation_state_id.setValue(this.family.curation_state_id);
      controls.disabled.setValue(this.family.disabled);
      controls.target_site_cons.setValue(this.family.target_site_cons);
      controls.curation_notes.setValue(this.family.curation_notes);
      controls.author.setValue(this.family.author);

      const aliasesArray = controls.aliases as FormArray;
      aliasesArray.clear();
      this.family.aliases.forEach(a => {
        this.addAlias(a);
      });

      const citationsArray = controls.citations as FormArray;
      citationsArray.clear();
      this.family.citations.forEach(c => {
        this.addCitation(c);
      });

      const cladesArray = controls.clades as FormArray;
      cladesArray.clear();
      for (let i = 0; i < this.family.clades.length; i++) {
        const full_name = this.family.clades[i];
        const semi_at = full_name.lastIndexOf(';');
        this.addClade({
          id: this.family.clade_ids[i],
          name: full_name.substring(semi_at + 1),
        });
      }

      const sStagesArray = controls.search_stages as FormArray;
      sStagesArray.clear();
      this.family.search_stages.forEach(ss => {
        this.addSearchStage(ss.id);
      });

      const bStagesArray = controls.buffer_stages as FormArray;
      bStagesArray.clear();
      this.family.buffer_stages.forEach(bs => {
        this.addBufferStage({ stage: bs.id, start: bs.start, end: bs.end });
      });
    });
  }

  getMetadata() {
    this.dfambackendapi.getMetadata().subscribe(meta => {
      if (meta) {
        this.curationStateOptions = meta.curation_states;
        this.rmStageOptions = meta.repeatmasker_stages;
      }
    });
  }

  getClassifications() {
    this.dfambackendapi.getClasses().subscribe(root => {
      if (!root) {
        return;
      }

      const flatten = function(node) {
        let flattened = [node];
        if (node.children) {
          node.children.map(flatten).forEach(child => flattened = flattened.concat(child));
        }
        return flattened;
      };

      const flattened_all = flatten(root);
      this.allClassificationsSubject.next(flattened_all);
      this.rootClassificationSubject.next(<Classification>root);
    });
  }

  saveFamily() {
    // Ensure the form is valid.
    if (!this.familyForm.valid) {
      // Mark all as touched, so that any untouched controls can now properly appear as invalid
      this.familyForm.markAllAsTouched();
      this.errorsService.logError('Form is incomplete or invalid.');
      return;
    }

    if (this.saving) {
      return;
    }
    this.saving = true;

    // NB: We do a manul diff here instead of checking control.dirty: That
    // approach will give false updates if edits are undone before submitting.

    const old = this.family;
    const controls = this.familyForm.controls;

    const changeset: any = {};

    // This is used to ensure simultaneous users do not step on each others
    // toes while editing the same family
    changeset.verify_date_modified = old.date_modified;

    function copyIfChanged(field: string, controlField?: string) {
      controlField = controlField || field;
      if (old[field] !== controls[controlField].value) {
        changeset[field] = controls[controlField].value;
      }
    }

    copyIfChanged('name');
    copyIfChanged('title');
    copyIfChanged('description');
    copyIfChanged('classification_id');
    copyIfChanged('curation_state_id');
    copyIfChanged('disabled');
    copyIfChanged('target_site_cons');
    copyIfChanged('curation_notes');
    copyIfChanged('author');

    // Change checking aliases is a bit tricky. First, we convert
    // the form values back to objects. Then, we check the number
    // of aliases. Finally, we walk through one by one. If anything
    // doesn't match up exactly, we assume all aliases need
    // to be sent to the server.

    const aliasesArray = controls.aliases as FormArray;
    const aliasObjs = (<FormGroup[]>aliasesArray.controls).map(a => {
      const alias_controls = < { [key: string]: FormControl }>(a.controls);
      return {
        database: alias_controls['database'].value,
        alias: alias_controls['alias'].value,
        comment: alias_controls['comment'].value || '',
        deprecated: alias_controls['deprecated'].value,
      };
    });

    let aliasesChanged = false;
    if (aliasObjs.length === old.aliases.length) {
      const aliasFieldChanged = function(i, field) {
        return aliasObjs[i][field] !== old.aliases[i][field];
      };

      for (let i = 0; i < aliasObjs.length; i++) {
        if (
            aliasFieldChanged(i, 'database') ||
            aliasFieldChanged(i, 'alias') ||
            aliasFieldChanged(i, 'comment') ||
            aliasFieldChanged(i, 'deprecated')
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
      const cit_controls = < { [key: string]: FormControl }>(c.controls);
      return {
        pmid: cit_controls['pmid'].value,
        comment: cit_controls['comment'].value || '',
      };
    });

    let citationsChanged = false;
    if (citationObjs.length === old.citations.length) {
      const citationFieldChanged = function(i, field) {
        return citationObjs[i][field] !== old.citations[i][field];
      };

      for (let i = 0; i < citationObjs.length; i++) {
        if (
            citationFieldChanged(i, 'pmid') ||
            citationFieldChanged(i, 'comment')
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

    // Clades is a bit easier because it's just the one field.

    const cladesArray = controls.clades as FormArray;
    const cladeVals = (<FormGroup[]>cladesArray.controls)
      .map(c => c.value ? parseInt(c.value.id, 10) : NaN)
      .filter(c => !isNaN(c));

    let cladesChanged = false;
    if (cladeVals.length === old.clade_ids.length) {
      for (let i = 0; i < cladeVals.length; i++) {
        if (cladeVals[i] !== old.clade_ids[i]) {
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

    // Search stages

    const searchStagesArray = controls.search_stages as FormArray;
    const searchStageVals = (<FormGroup[]>searchStagesArray.controls).map(c => c.value);

    let searchStagesChanged = false;
    if (searchStageVals.length === old.search_stages.length) {
      for (let i = 0; i < searchStageVals.length; i++) {
        if (searchStageVals[i] !== old.search_stages[i].id) {
          searchStagesChanged = true;
          break;
        }
      }
    } else {
      searchStagesChanged = true;
    }

    if (searchStagesChanged) {
      changeset.search_stages = searchStageVals;
    }

    // Buffer stages

    const bufferStagesArray = controls.buffer_stages as FormArray;
    const bufferStageObjs = bufferStagesArray.value;

    let bufferStagesChanged = false;
    if (bufferStageObjs.length === old.buffer_stages.length) {

      const bufferStageFieldChanged = function(i, field) {
        return bufferStageObjs[i][field] !== old.buffer_stages[i][field];
      };

      for (let i = 0; i < bufferStageObjs.length; i++) {
        if (
            bufferStageObjs[i].stage !== old.buffer_stages[i].id ||
            bufferStageFieldChanged(i, 'start') ||
            bufferStageFieldChanged(i, 'end')
        ) {
          bufferStagesChanged = true;
          break;
        }
      }
    } else {
      bufferStagesChanged = true;
    }

    if (bufferStagesChanged) {
      changeset.buffer_stages = bufferStageObjs;
    }

    // Finally, send the patch request.

    this.dfambackendapi.patchFamily(this.family.accession, changeset).subscribe(r => {
      this.saving = false;
      this.getFamily();
    }, e => {
      this.saving = false;
    });
  }

  displayClassById(id: number): Observable<string> {
    return this.allClassificationsSubject.pipe(map(clss => {
      const cls = clss.find(c => c.id === id);
      if (cls) {
        return cls.full_name.replace(/;/g, '; ');
      } else {
        return '<Unknown>';
      }
    }));
  }

  displayClade(clade: any): string {
    return clade ? clade.name : '';
  }

  pickClassification() {
    this.rootClassificationSubject.subscribe(root => {
      const dialogRef = this.dialog.open(FamilyClassificationDialogComponent, {
        data: { rootNode: root },
        width: '50vw',
      });
      dialogRef.afterClosed().subscribe(result => {
        const id = parseInt(result, 10);
        if (!isNaN(id)) {
          this.familyForm.controls.classification_id.setValue(id);
        }
      });
    });
  }
}
