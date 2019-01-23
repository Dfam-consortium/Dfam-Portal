import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { SearchSequenceComponent } from '../search/search-sequence.component';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private dfamapi: DfamAPIService,
    private router: Router,
    private http: HttpClient,
  ) {}

  showMore1 = false;
  dfamBlogArticles: Object = [];

  totalEntries: number;

  searchSequence: string;
  searchSubmitting: boolean;


  assemblies: any[] = [];
  annotations = {
    assembly: 'hg38',
    chromosome: '',
    start: '',
    end: '',
  };

  gotoEntryTarget: string;

  searchKeywords: string;

  ngOnInit() {
    this.dfamapi.getAssemblies().subscribe(data => this.assemblies = data);
    this.dfamapi.getFamilies({ limit: 0 }).subscribe(data => this.totalEntries = data.total_count);

    const blogUrl = 'http://query.yahooapis.com/v1/public/yql?q=select * from xml where url=\'https://xfam.wordpress.com/category/dfam/feed/\' &format=json';
    this.http
      .get<any>(blogUrl, { responseType: 'json' })
      .subscribe(res => {
        const monthNames = ['January', 'February', 'March', 'April', 'May',
                          'June', 'July', 'August', 'September',
                          'October', 'November', 'December' ];
        if (res && res.query && res.query.results && res.query.results.rss && res.query.results.rss.channel && res.query.results.rss.channel.item) {
          const articles = res.query.results.rss.channel.item;
          const articleData = [];
          articles.forEach(function(article) {
            const pubDate = new Date(article.pubDate);
            // Should scrub the description for HTML tags
            articleData.push({
              title: article.title,
              link: article.link,
              date: '' + monthNames[pubDate.getMonth() + 1] + ', ' +
                pubDate.getFullYear(),
              sortDate: pubDate,
              snippet: article.description.substr(0, 375)
            });
          });
          this.dfamBlogArticles = articleData.sort(function(a, b) {
              return b.sortDate - a.sortDate;
          });
        }
      });
  }

  searchByKeywords() {
    this.router.navigate(['browse'], { queryParams: { 'keywords': this.searchKeywords } });
  }

  onGotoEntry() {
    const LIMIT = 20;
    const searchTerm = this.gotoEntryTarget;

    this.dfamapi.getFamilies({
      'name_accession': searchTerm,
      'limit': LIMIT,
    }).subscribe((data: any) => {
      let found = false;
      if (data.total_count > 0) {
        // At least one match
        data.results.forEach(result => {
          if (result.accession === searchTerm || result.name === searchTerm) {
            this.router.navigate(['family', result.accession]);
            found = true;
          }
        });
      }

      if (!found) {
        this.router.navigate(['browse'], { queryParams: { 'name_accession': searchTerm } });
      }
    });
  }

  onSubmitSearch() {
    this.searchSubmitting = true;
    this.dfamapi.postSearch(this.searchSequence, 'other', 'curated', 0).subscribe(result => {
      this.searchSubmitting = false;
      if (result) {
        this.router.navigate(['search', 'results', result.id]);
      } else {
        // TODO: Report an error status
      }
    });
  }

  onExampleSearch() {
    this.searchSequence = SearchSequenceComponent.example.sequence;
  }

  onGotoAnnotations() {
    this.router.navigate(['search', 'annotations'], { queryParams: {
      'assembly': this.annotations.assembly,
      'chromosome': this.annotations.chromosome,
      'start': this.annotations.start,
      'end': this.annotations.end,
      'nrph': true,
    } });
  }

  onExampleAnnotations() {
    this.annotations.assembly = 'hg38';
    this.annotations.chromosome = 'chr3';
    this.annotations.start = '147733000';
    this.annotations.end = '147766820';
  }
}
