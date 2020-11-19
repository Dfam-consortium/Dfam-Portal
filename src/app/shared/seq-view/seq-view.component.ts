import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * @title Basic Inputs
 */
@Component({
  selector: 'dfam-seq-view',
  styleUrls: ['seq-view.component.scss'],
  templateUrl: 'seq-view.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SeqViewComponent implements OnInit {

  @Input() sequence: string;

  formatted_sequence_lines = [];
  highlight_regions = [];
  max_bp_per_line = 90;

  private seqSearchTerm = new Subject<string>();

  constructor() {
    // Generate a random sequence to test with
    // let DNA = 'ACGT';
    // for ( let i = 0; i < 500; i++ ){
    //    this.sequence += DNA.charAt(Math.floor(Math.random()*DNA.length))
    // }
  }

  ngOnInit() {
    this.seqSearchTerm.pipe(debounceTime(300)).subscribe(search_term => {
      this.processSearchTerm(search_term);
    });
    this.decorateText();
  }

  decorateText() {
    const textLen = this.sequence.length;
    const padding = textLen.toString().length;
    this.formatted_sequence_lines = [];
    let d_text = this.sequence;
    const shr = this.highlight_regions.sort((a, b) => b[1] - a[1]);
    shr.forEach(region => {
      if ( region[1] < d_text.length ) {
        d_text = d_text.substr(0, region[1]) + '</span>' + d_text.substr(region[1]);
      } else {
        d_text = d_text.substr(0, region[1]) + '</span>';
      }
      if ( region[0] > 0 ) {
        d_text = d_text.substr(0, region[0]) + '<span class="highlight">' + d_text.substr(region[0]);
      } else {
        d_text = '<span class="highlight">' + d_text.substr(region[0]);
      }
    });

    let i = 0;
    let seq_pos = 0;
    let line = '';
    const max_line_len = this.max_bp_per_line;
    let in_tag = false;
    let bases_in_line = 0;
    let in_span = false;

    const formatted_sequence_lines = this.formatted_sequence_lines;
    function finish_line() {
      if ( in_span ) {
        // Add a closing span
        line += '</span>';
      }
      const start = seq_pos + 1;
      const end = seq_pos + bases_in_line;
      const start_str = start.toString().padStart(padding, '0');
      const end_str = end.toString().padStart(padding, '0');
      formatted_sequence_lines.push({
        'start': start_str,
        'end': end_str,
        'text': line,
      });
    }

    while ( i < d_text.length ) {
       const c = d_text.charAt(i);
       if ( c === '<' ) {
          in_tag = true;
          if ( d_text.charAt(i + 1) === '/' ) {
            in_span = false;
          } else {
            in_span = true;
          }
       } else if ( c === '>') {
          in_tag = false;
          i++;
          line += c;
          continue;
       }

       if ( !in_tag && bases_in_line === max_line_len  ) {
         finish_line();
          seq_pos += max_line_len;
          bases_in_line = 0;
          line = '';
          if ( in_span ) {
            // Start span tag again
            line += '<span class="highlight">';
          }
       }

       line += c;
       if ( !in_tag ) {
         bases_in_line++;
       }
       i++;
    }
    // Handle trailing case
    finish_line();
  }

  onKeyPress(value: any) {
    this.seqSearchTerm.next(value);
  }

  processSearchTerm( value: any ) {

      const num_range_re = /(\d+)-(\d+)/;
      const base_search_re = /([ACGTRYKMSWBDHVNX]+)/;
      const num_re = /(\d+)/;

      // Clear previous highlighting
      this.highlight_regions = [];

      // Range match ( e.g 1-30 )
      let mats = num_range_re.exec(value);
      if ( mats ) {
        const r_start = parseInt(mats[1], 10);
        const r_end = parseInt(mats[2], 10);
        if ( r_start < r_end ) {
          this.highlight_regions = [ [r_start - 1, r_end] ];
          this.decorateText();
        }
        return;
      }

      // Single position match ( e.g 10 )
      mats = num_re.exec(value);
      if ( mats ) {
        this.highlight_regions = [ [parseInt(mats[1], 10) - 1, parseInt(mats[1], 10)] ];
        this.decorateText();
        return;
      }

      // IUB Substring Match
      value = value.toUpperCase();
      mats = base_search_re.exec(value);
      if ( mats ) {
        const sub_re = RegExp(mats[1], 'g');
        this.highlight_regions = [];
        let smats;
        do {
          smats = sub_re.exec(this.sequence);
          if ( smats ) {
            this.highlight_regions.push( [smats.index, smats.index + mats[1].length] );
          }
        } while (smats);
      }
      this.decorateText();
   }

}
