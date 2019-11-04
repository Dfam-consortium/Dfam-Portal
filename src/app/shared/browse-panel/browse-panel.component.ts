import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
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

@Component({
  selector: 'dfam-browse-panel',
  templateUrl: './browse-panel.component.html',
  styleUrls: ['./browse-panel.component.scss']
})
export class BrowsePanelComponent implements OnInit, AfterViewInit {

  @Input() repository: FamilyRepository & ClassesRepository & TaxaRepository;

  families: any = {};

  search: any = {};
  searchApiOptions: any = { };

  classOptions: any[] = [];
  cladeOptions: any[] = [];

  disableDownload = false;
  downloadUrls = {};

  private classSearchTerm = new Subject<string>();
  private cladeSearchTerm = new Subject<string>();
  private updateUrlTask = new Subject<void>();

  displayColumns = [ 'accession', 'name', 'classification', 'clades', 'title', 'length' ];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

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

        const exact = [], starts = [], contains = [];
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

      this.repository.getTaxa(search_term.trim()).subscribe(clades => {
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
  }

  ngAfterViewInit() {
    this.restoreSearch();
  }

  displayClass(classification: any) {
    return classification ? classification.name : '';
  }

  displayClade(clade: any) {
    return clade ? clade.name : '';
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
    const initialCladeD = queryParamMap.get('clade_descendants') === 'true';
    if (initialCladeD) {
      this.search.clade_descendants = initialCladeD;
      this.searchApiOptions.clade_descendants = initialCladeD;
    }
    const initialK = this.route.snapshot.queryParamMap.get('keywords');
    if (initialK) {
      this.search.keywords = initialK;
      this.searchApiOptions.keywords = initialK;
    }
    const initialP = parseInt(this.route.snapshot.queryParamMap.get('page'), 10);
    if (initialP) {
      const initialPS = parseInt(this.route.snapshot.queryParamMap.get('pageSize'), 10);
      this.paginator.pageIndex = initialP;
      this.paginator.pageSize = initialPS;
    }
    const initialSort = this.route.snapshot.queryParamMap.get('sort');
    if (initialSort) {
      const parts = initialSort.split(':');
      if (parts.length === 2) {
        this.sort.active = parts[0];
        this.sort.direction = parts[1] as SortDirection;
        this.searchApiOptions.sort = initialSort;
      }
    }

    forkJoin(pending).subscribe({
      complete: () => { this.getFamilies(); }
    });
  }

  searchChanged() {
    this.searchApiOptions.name_accession = this.search.name_accession;
    this.searchApiOptions.classification = this.search.classification ? this.search.classification.full_name : null;
    this.searchApiOptions.clade = this.search.clade ? this.search.clade.id : null;
    this.searchApiOptions.clade_ancestors = this.search.clade_ancestors;
    this.searchApiOptions.clade_descendants = this.search.clade_descendants;
    this.searchApiOptions.keywords = this.search.keywords;

    this.paginator.pageIndex = 0;
    this.updateUrlTask.next();
    this.getFamilies();
  }

  updateUrl() {
    const queryParams: any = {};

    if (this.searchApiOptions.name_accession) {
      queryParams.name_accession = this.searchApiOptions.name_accession;
    }
    if (this.searchApiOptions.classification) {
      queryParams.classification = this.searchApiOptions.classification;
    }
    if (this.searchApiOptions.clade) {
      queryParams.clade = this.searchApiOptions.clade;
    }
    if (this.searchApiOptions.clade_ancestors) {
      queryParams.clade_ancestors = this.searchApiOptions.clade_ancestors;
    }
    if (this.searchApiOptions.clade_descendants) {
      queryParams.clade_descendants = this.searchApiOptions.clade_descendants;
    }
    if (this.searchApiOptions.keywords) {
      queryParams.keywords = this.searchApiOptions.keywords;
    }
    if (this.paginator.pageIndex) {
      queryParams.pageSize = this.paginator.pageSize;
      queryParams.page = this.paginator.pageIndex;
    }
    if (this.searchApiOptions.sort) {
      queryParams.sort = this.searchApiOptions.sort;
    }

    this.router.navigate([], { queryParams, replaceUrl: true });
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
    if (sort.direction) {
      this.searchApiOptions.sort = sort.active + ':' + sort.direction;
    } else {
      delete this.searchApiOptions.sort;
    }
    this.updateUrlTask.next();
    this.getFamilies();
  }

  pageChanged(event: PageEvent) {
    this.updateUrlTask.next();
    this.getFamilies();
  }

  getFamilies() {
    this.searchApiOptions.limit = this.paginator.pageSize;
    this.searchApiOptions.start = this.paginator.pageSize * this.paginator.pageIndex;
    this.repository.getFamilies(this.searchApiOptions).subscribe(data => {
      this.disableDownload = (data.total_count <= 0 || data.total_count > 2000);
      for (const format of ['hmm', 'embl', 'fasta']) {
        this.downloadUrls[format] = this.repository.getFamiliesDownloadUrl(this.searchApiOptions, format);
      }

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
