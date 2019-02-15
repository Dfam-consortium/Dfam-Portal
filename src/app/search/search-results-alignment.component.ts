import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dfam-search-results-alignment',
  templateUrl: './search-results-alignment.component.html',
  styleUrls: ['./search-results-alignment.component.scss']
})
export class SearchResultsAlignmentComponent implements OnInit {

  @Input() hit;

  @Input() getAlignCallback;

  stars = '.........*'.repeat(10);
  chunks: any[] = [];

  WIDTH = 80;

  constructor() { }

  ngOnInit() {
    this.getAlignment();
  }

  getAlignment() {
    this.getAlignCallback(this.hit).subscribe(data => this.processAlignmentData(data));
  }

  processAlignmentData(data) {
    if (!data) {
      return;
    }

    this.chunks = [];
    let mod_start = data.hmm.start;
    let seq_start = data.seq.start;

    const ALPHAS = /[A-Za-z]/g;
    const reversed = data.seq.start > data.seq.end;

    for (let i = 0; i < data.hmm.string.length; i += this.WIDTH) {
      const chunk: any = {};

      chunk.mod_str = data.hmm.string.substring(i, i + this.WIDTH);
      chunk.match_str = data.match.string.substring(i, i + this.WIDTH);
      chunk.seq_str = data.seq.string.substring(i, i + this.WIDTH);
      chunk.pp_str = data.pp.string.substring(i, i + this.WIDTH);

      chunk.mod_markup = '<span class="hmmmatch">';
      for (let j = 0; j < chunk.mod_str.length; j++) {
        const match = chunk.match_str[j];
        const ch = chunk.mod_str[j];
        // TODO: batch consecutive groups
        if (match === ' ') {
          chunk.mod_markup += '<span class="hmmminus">' + ch + '</span>';
        } else if (match === '+') {
          chunk.mod_markup += '<span class="hmmplus">' + ch + '</span>';
        } else {
          chunk.mod_markup += ch;
        }
      }
      chunk.mod_markup += '</span>';

      chunk.seq_markup = '';
      for (let j = 0; j < chunk.seq_str.length; j++) {
        let pp = chunk.pp_str[j];
        const ch = chunk.seq_str[j];
        if (pp === '*') {
          pp = 'star';
        }
        if (pp === ' ') {
          pp = 'gap';
        }

        chunk.seq_markup += '<span class="heat' + pp + '">' + ch + '</span>';
      }

      chunk.mod_start = mod_start;
      chunk.mod_end = mod_start + chunk.mod_str.match(ALPHAS).length - 1;

      chunk.seq_start = seq_start;
      let seq_alphas = chunk.seq_str.match(ALPHAS).length - 1;
      if (reversed) {
        seq_alphas = -seq_alphas;
      }
      chunk.seq_end = seq_start + seq_alphas;

      mod_start = chunk.mod_end + 1;
      if (reversed) {
        seq_start = chunk.seq_end - 1;
      } else {
        seq_start = chunk.seq_end + 1;
      }

      this.chunks.push(chunk);
    }
  }
}
