import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Http, Response} from '@angular/http'
import {map} from 'rxjs/operators';

@Component({
  selector: '',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  title = 'Dfam';
  showMore1=false;
  result: Object;
  dfamBlogArticles: Object = [];

  constructor(private router: Router, http: Http) {
  http.get('http://query.yahooapis.com/v1/public/yql?q=select * from xml where url=\'https://xfam.wordpress.com/category/dfam/feed/\' &format=json')
           .pipe(map(res => res.json()))
           .subscribe(res => {
              var monthNames = ["January", "February", "March", "April", "May",
                                "June", "July", "August", "September",
                                "October", "November", "December" ];
              if (res && res.query && res.query.results && res.query.results.rss && res.query.results.rss.channel && res.query.results.rss.channel.item) {
                var articles = res.query.results.rss.channel.item;
                var articleData = [];
                articles.forEach(function(article) {
                    var pubDate = new Date(article.pubDate);
                    // Should scrub the description for HTML tags
                    articleData.push({
                        title: article.title,
                        link: article.link,
                        date: "" + monthNames[pubDate.getMonth() + 1] + ", " +
                            pubDate.getFullYear(),
                        sortDate: pubDate,
                        snippet: article.description.substr(0,375)
                    });
                });
                this.dfamBlogArticles = articleData.sort(function(a, b) {
                    return b.sortDate - a.sortDate;
                });

               }
           });
  }

  searchKeywords: string;

  searchByKeywords() {
    this.router.navigate(['browse'], { queryParams: { "keywords": this.searchKeywords } });
  }

  gotoAccession: string;

  onGotoAccession() {
    this.router.navigate(['family', this.gotoAccession]);
  }

  annotations = {
    assembly: "hg38",
    chromosome: "",
    start: "",
    end: "",
  };

  onGotoAnnotations() {
    this.router.navigate(['search', 'annotations'], { queryParams: {
      "assembly": this.annotations.assembly,
      "chromosome": this.annotations.chromosome,
      "start": this.annotations.start,
      "end": this.annotations.end,
      "nrph": true,
    } });
  }

  onExampleAnnotations() {
    this.annotations.assembly = "hg38";
    this.annotations.chromosome = "chr3";
    this.annotations.start = '147733000';
    this.annotations.end = '147766820';
  }
}
