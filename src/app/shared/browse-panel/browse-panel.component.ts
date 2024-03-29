import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { FamilyRepository, ClassesRepository, TaxaRepository } from '../dfam-api/common';

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

function has_duplicates(array: any[]) {
  for (let i = 0; i < array.length - 1; i++) {
    if (array.indexOf(array[i], i + 1) !== -1) {
      return true;
    }
  }

  return false;
}

// "unusual" characters, here defined as "anything that should not show up in a name"
const UNUSUAL_REGEXP = /[^A-Za-z0-9._-]/;

@Component({
  selector: 'dfam-browse-panel',
  templateUrl: './browse-panel.component.html',
  styleUrls: ['./browse-panel.component.scss']
})
export class BrowsePanelComponent implements OnInit {

  @Input() repository: FamilyRepository & ClassesRepository & TaxaRepository;
  @Input() isEditing: boolean;

  families: any = {};

  search: any = {};
  sortActive: string = '';
  sortDirection: SortDirection = '';
  pageSize = 20;
  pageIndex = 0;
  searchApiOptions: any = { };

  searchSubmitting: boolean;

  classOptions: any[] = [];
  cladeOptions: any[] = [];

  disableDownload = false;
  downloadLimit: number = 10000;
  // downloadLimit: number = 2000;
  downloadUrls = {};

  unusualNameCharacter?: string = null;

  notes:object= {
      classification: 'Classification searches include all descendant classifications',
      include_raw: 'Including uncurated families in the search will take extra time'
  }
  displayNotes: string[] = []

  private classSearchTerm = new Subject<string>();
  private cladeSearchTerm = new Subject<string>();
  private updateUrlTask = new Subject<void>();

  // These queries can take a long time. Storing the Subscription allows us to
  // cancel a query if another one is made before it finishes, so that only the
  // most recent query is respected.
  private getTaxaSubscription: Subscription;
  private getFamiliesSubscription: Subscription;

  displayColumns = [ 'accession', 'name', 'classification', 'clades', 'title', 'length' ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.classSearchTerm.pipe(debounceTime(300)).subscribe(search_term => {
      this.repository.getClasses(search_term.trim()).subscribe(classes_ => {
        let classes = classes_ as any[];

        classes = classes.filter(f => f.name !== 'root');

        // Cache name variants and highlight the search term in the leaf name
        classes.forEach(c => {
          c.names = c.full_name.split(';');

          c.sort_name = c.name.toLowerCase();

          c.name_markup = c.name;
          if (c.aliases) {
            c.name_markup += ' (' + c.aliases + ')';
          }
          c.name_markup = c.name_markup.replace(new RegExp(preg_quote(search_term), 'gi'), '<strong>$&</strong>');
        });

        // Add parent names until the names are unambiguous or a maximum depth is reached
        let depth = 1;
        while (depth < 5 && (depth < 2 || has_duplicates(classes.map(c => c.name_markup)))) {
          depth += 1;
          for (let i = 0; i < classes.length; i++) {
            const c = classes[i];
            const start = c.names.length - depth;
            if (start < 0) { continue; }
            const parent_name = c.names[start];
            c.name_markup = parent_name + ';' + c.name_markup;
          }
        }

        const exact = [];
        const starts = [];
        const contains = [];
        classes.forEach(c => {
          if (c.sort_name === search_term.toLowerCase()) {
            exact.push(c);
          } else if (c.sort_name.startsWith(search_term.toLowerCase())) {
            starts.push(c);
          } else {
            contains.push(c);
          }
        });

        function compareName(a, b) {
          if (a.sort_name < b.sort_name) {
            return -1;
          } else if (a.sort_name > b.sort_name) {
            return 1;
          } else {
            return 0;
          }
        }

        starts.sort(compareName);
        contains.sort(compareName);

        this.classOptions = exact.concat(starts).concat(contains);
      });
    });

    this.cladeSearchTerm.pipe(debounceTime(300)).subscribe(search_term => {
      // escape search_term so it will be found in the escaped markup
      const escaped_search_term = search_term.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

      if (this.getTaxaSubscription) {
        this.getTaxaSubscription.unsubscribe();
      }
      this.getTaxaSubscription = this.repository.getTaxa(search_term.trim()).subscribe(clades => {
        this.cladeOptions = clades.taxa.filter(f => f.name !== 'root');
        this.cladeOptions.forEach(c => {
          c.name_markup = c.name;
          // escape HTML special chars
          c.name_markup = c.name_markup.replace(/&/, '&amp;').replace(/</, '&lt;').replace(/>/, '&gt;');

          c.name_markup = c.name_markup.replace(new RegExp(preg_quote(escaped_search_term), 'gi'), '<strong>$&</strong>');
        });
      });
    });

    this.updateUrlTask.pipe(debounceTime(300)).subscribe(() => {
      this.updateUrl();
    });

    this.restoreSearch();
  }

  displayClass(classification: any) {
    return classification ? classification.name : '';
  }

  displayClade(clade: any) {
    return clade ? clade.name : '';
  }

  findUnusualCharacter(term: string) {
    const result = UNUSUAL_REGEXP.exec(term);
    if (result) {
      return result[0];
    } else {
      return null;
    }
  }

  restoreSearch() {
    const queryParamMap = this.route.snapshot.queryParamMap;

    const pending = [];

    const initialNA = queryParamMap.get('name_accession');
    if (initialNA) {
      this.search.name_accession = initialNA;
      this.searchApiOptions.name_accession = initialNA;
    }
    const initialClass = queryParamMap.get('classification');
    if (initialClass) {
      const lastSemi = initialClass.lastIndexOf(';');
      if (lastSemi !== -1) {
        const lastSegment = initialClass.substring(lastSemi + 1);
        this.search.classification = { name: lastSegment, full_name: initialClass };
        this.searchApiOptions.classification = initialClass;
      }
    }
    const initialClade = parseInt(queryParamMap.get('clade'), 10);
    if (initialClade) {
      pending.push(this.repository.getTaxonById(initialClade).pipe(map(taxon => {
        if (taxon) {
          this.search.clade = taxon;
        }
      })));
      this.searchApiOptions.clade = initialClade;
    }
    const initialCladeA = queryParamMap.get('clade_ancestors') === 'true';
    if (initialCladeA) {
      this.search.clade_ancestors = initialCladeA;
      this.searchApiOptions.clade_ancestors = initialCladeA;
    }
    const initialCladeD = queryParamMap.get('clade_descendants') !== 'false';
    if (initialCladeD) {
      this.search.clade_descendants = initialCladeD;
      this.searchApiOptions.clade_descendants = initialCladeD;
    }
    const initialK = this.route.snapshot.queryParamMap.get('keywords');
    if (initialK) {
      this.search.keywords = initialK;
      this.searchApiOptions.keywords = initialK;
    }
    const initialR = this.route.snapshot.queryParamMap.get('include_raw');
    if (initialR) {
      this.search.include_raw = initialR;
      this.searchApiOptions.include_raw = initialR;
    }
    const initialP = parseInt(this.route.snapshot.queryParamMap.get('page'), 10);
    if (initialP) {
      const initialPS = parseInt(this.route.snapshot.queryParamMap.get('pageSize'), 10);
      this.pageIndex = initialP;
      this.pageSize = initialPS;
    }
    const initialSort = this.route.snapshot.queryParamMap.get('sort');
    if (initialSort) {
      const parts = initialSort.split(':');
      if (parts.length === 2) {
        this.sortActive = parts[0];
        this.sortDirection = parts[1] as SortDirection;
        this.searchApiOptions.sort = initialSort;
      }
    }

    forkJoin(pending).subscribe({
      complete: () => { this.getFamilies(); }
    });
  }

  updateNotes() {
    this.displayNotes = []
    Object.keys(this.searchApiOptions).forEach((option) => {
      if (this.searchApiOptions[option]){
        if (this.notes[option]) {
          this.displayNotes.push(this.notes[option])
        }
      }
    }) 
  }

  searchChanged() {
    this.unusualNameCharacter = this.findUnusualCharacter(this.search.name_accession);

    this.searchApiOptions.name_accession = this.search.name_accession;
    this.searchApiOptions.classification = this.search.classification ? encodeURIComponent(this.search.classification.full_name) : null;
    this.searchApiOptions.clade = this.search.clade ? this.search.clade.id : null;
    this.searchApiOptions.clade_ancestors = this.search.clade_ancestors;
    this.searchApiOptions.clade_descendants = this.search.clade_descendants;
    this.searchApiOptions.keywords = this.search.keywords;
    this.searchApiOptions.include_raw = this.search.include_raw;
    this.updateNotes()

    this.pageIndex = 0;
    this.updateUrlTask.next();
    this.getFamilies();
  }

  updateUrl() {
    const queryParams: any = {};

    if (this.searchApiOptions.name_accession) {
      queryParams.name_accession = this.searchApiOptions.name_accession;
    }
    if (this.searchApiOptions.classification) {
      queryParams.classification = encodeURIComponent(this.searchApiOptions.classification);
    }
    if (this.searchApiOptions.clade) {
      queryParams.clade = this.searchApiOptions.clade;
    }
    if (this.searchApiOptions.clade_ancestors) {
      queryParams.clade_ancestors = this.searchApiOptions.clade_ancestors;
    }
    queryParams.clade_descendants = this.searchApiOptions.clade_descendants;
    if (this.searchApiOptions.keywords) {
      queryParams.keywords = this.searchApiOptions.keywords;
    }
    if (this.searchApiOptions.include_raw) {
      queryParams.include_raw = this.searchApiOptions.include_raw;
    }
    if (this.pageIndex > 0) {
      queryParams.pageSize = this.pageSize;
      queryParams.page = this.pageIndex;
    }
    if (this.searchApiOptions.sort) {
      queryParams.sort = this.searchApiOptions.sort;
    }

    this.router.navigate([], { queryParams, replaceUrl: true });
  }

  clearSearch() {
    this.search.name_accession = null;
    this.search.classification = null;
    this.search.clade = null;
    this.search.clade_ancestors = false;
    this.search.clade_descendants = true;
    this.search.keywords = null;
    this.search.include_raw = false;
    this.searchChanged();
  }

  updateClasses() {
    const search_term = this.search.classification;

    if (search_term) {
      this.classSearchTerm.next(search_term);
    } else {
      this.classOptions = [];
      this.searchChanged();
    }
  }

  updateClades() {
    const search_term = this.search.clade;
    if (search_term) {
      this.cladeSearchTerm.next(search_term);
    } else {
      this.cladeOptions = [];
      this.searchChanged();
    }
  }

  sortChanged(sort: Sort) {
    this.sortActive = sort.active
    this.sortDirection = sort.direction
    if (this.sortDirection) {
      this.searchApiOptions.sort = sort.active + ':' + sort.direction;
    } else {
      delete this.searchApiOptions.sort
    }
    this.updateUrlTask.next();
    this.getFamilies();
  }

  pageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUrlTask.next();
    this.getFamilies();
  }

  getFamilies() {
    if (this.getFamiliesSubscription) {
      this.getFamiliesSubscription.unsubscribe();
    }
    this.searchSubmitting = true
    this.searchApiOptions.limit = this.pageSize;
    this.searchApiOptions.start = this.pageSize * this.pageIndex;
    this.getFamiliesSubscription = this.repository.getFamilies(this.searchApiOptions).subscribe(data => {
      this.disableDownload = (data.total_count <= 0 || data.total_count > this.downloadLimit);
      for (const format of ['hmm', 'embl', 'fasta']) {
        this.downloadUrls[format] = this.repository.getFamiliesDownloadUrl(this.searchApiOptions, format);
      }
      this.searchSubmitting = false
      this.families = data;
      this.families.results.forEach(function(family) {
        if (family.classification) {
          const cls = family.classification;
          family.classification_display = cls.substring(cls.lastIndexOf(';') + 1);
          family.classification_tooltip = cls.replace('root;', '');
          family.classification_tooltip = family.classification_tooltip.replace(/;/g, '; ');
        }
        if (family.clades) {
          family.display_clades = family.clades.map(cl => {
            const name = cl.substring(cl.lastIndexOf(';') + 1);
            const tooltip = cl.replace(/^root;/, '').replace(/;/g, '; ');
            return { name, tooltip };
          });
        }
      });
    });
  }
}
