import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormBuilder, FormArray, FormControl } from '@angular/forms';

import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';

@Component({
  selector: 'dfam-workbench-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class WorkbenchFamilyComponent implements OnInit {
  family;

  familyForm = this.fb.group({
    title: [''],
    description: [''],
    target_site_cons: [''],
    curation_notes: [''],
    author: [''],
    aliases: this.fb.array([]),
    citations: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private dfambackendapi: DfamBackendAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  addAlias() {
    const aliasesArray = this.familyForm.controls.aliases as FormArray;
    aliasesArray.push(this.fb.group({ database: '', alias: '' }));
  }

  addCitation() {
    const citationsArray = this.familyForm.controls.citations as FormArray;
    citationsArray.push(this.fb.group({ pmid: null }));
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfambackendapi.getFamily(accession).subscribe(data => {
      this.family = data;

      this.familyForm.controls.title.setValue(this.family.title);
      this.familyForm.controls.description.setValue(this.family.description);
      this.familyForm.controls.target_site_cons.setValue(this.family.target_site_cons);
      this.familyForm.controls.curation_notes.setValue(this.family.curation_notes);
      this.familyForm.controls.author.setValue(this.family.author);

      const aliasesArray = this.familyForm.controls.aliases as FormArray;
      aliasesArray.clear();
      this.family.aliases.forEach(a => {
        aliasesArray.push(this.fb.group({ database: a.database, alias: a.alias }));
      });

      const citationsArray = this.familyForm.controls.citations as FormArray;
      citationsArray.clear();
      this.family.citations.forEach(c => {
        citationsArray.push(this.fb.group({ pmid: c.pmid }));
      });
    });
  }
}
