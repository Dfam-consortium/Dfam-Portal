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
export class SeqViewComponent implements OnInit{

   @Input() sequence: string;

   formatted_sequence_lines = [];
   highlight_regions = [];
   max_bp_per_line = 90;
  
   private seqSearchTerm = new Subject<string>();

   constructor(){
     // Generate a random sequence to test with
     //let DNA = "ACGT";
     //for ( let i = 0; i < 500; i++ ){
     //   this.sequence += DNA.charAt(Math.floor(Math.random()*DNA.length))
     //}
   }

   ngOnInit() {
     this.seqSearchTerm.pipe(debounceTime(300)).subscribe(search_term => {
       this.processSearchTerm(search_term);
     });
     this.decorateText();
   }

   decorateText(){
     let textLen = this.sequence.length;
     let padding = textLen.toString().length;
     this.formatted_sequence_lines = [];
     let d_text = this.sequence;
     let shr = this.highlight_regions.sort(function(a,b){return b[1]-a[1];})
     for ( let i = 0; i < shr.length; i++ ){
       if ( shr[i][1] < d_text.length ){
         d_text = d_text.substr(0,shr[i][1]) + "</span>" + d_text.substr(shr[i][1]);
       }else {
         d_text = d_text.substr(0,shr[i][1]) + "</span>"
       }
       if ( shr[i][0] > 0 ) {
         d_text = d_text.substr(0,shr[i][0]) + "<span class='highlight'>" + d_text.substr(shr[i][0]);
       }else{
         d_text = "<span class='highlight'>" + d_text.substr(shr[i][0]);
       }
     }
     let i = 0;
     let seq_pos = 0;
     let line = "";
     let max_line_len = this.max_bp_per_line;
     let in_tag = 0;
     let bases_in_line = 0;
     let in_span = 0;
     while ( i < d_text.length ){
        let c = d_text.charAt(i);
        if ( c == '<' ) {
           in_tag = 1;
           if ( d_text.charAt(i+1) == "/" ) 
	     in_span = 0;
           else
             in_span = 1;
        }else if ( c == '>') {
           in_tag = 0;
           i++;
           line += c;
           continue;
        }

        if ( in_tag == 0 && bases_in_line == max_line_len  ) {
           if ( in_span ) {
             // Add a closing span
             line += "</span>";
           }
           let start = seq_pos + 1;
           let end = seq_pos + max_line_len;
           let start_str = start.toString().padStart(padding,'0');
           let end_str = end.toString().padStart(padding,'0');
           this.formatted_sequence_lines.push({ 'start': start_str,
                                                'end': end_str, 
                                                'text': line });
           seq_pos += max_line_len;
           bases_in_line = 0;
           line = "";
           if ( in_span ) {
             // Start span tag again
             line += "<span class='highlight'>";
           }
        }

        line += c
        if ( in_tag == 0 ) {
          bases_in_line++;
        }        
        i++;
     }
     // Handle trailing case
     if ( in_span ) {
       // Add a closing span
       line += "</span>";
     }
     let start = seq_pos + 1;
     let end = seq_pos + bases_in_line;
     let start_str = start.toString().padStart(padding,'0');
     let end_str = end.toString().padStart(padding,'0');
     this.formatted_sequence_lines.push({ 'start': start_str,
                                          'end': end_str, 
                                          'text': line });
   }


  onKeyPress( value: any){
    this.seqSearchTerm.next(value);
  }


  processSearchTerm( value: any ) {

      var num_range_re = /(\d+)-(\d+)/;
      var base_search_re = /([ACGTRYKMSWBDHVNX]+)/;
      var num_re = /(\d+)/;
      var mats = num_range_re.exec(value);
      
      // Clear previous highlighting
      this.highlight_regions = [];

      // Range match ( e.g 1-30 )
      if ( mats ) {
        let r_start = parseInt(mats[1]);
        let r_end = parseInt(mats[2]);
        if ( r_start < r_end ) {
          this.highlight_regions = [ [r_start-1, r_end] ];
          this.decorateText();
        }
        return;
      }

      // Single position match ( e.g 10 )
      var mats = num_re.exec(value);
      if ( mats ) {
        this.highlight_regions = [ [parseInt(mats[1])-1, parseInt(mats[1])] ];
        this.decorateText();
        return;
      }

      // IUB Substring Match
      value = value.toUpperCase();
      var mats = base_search_re.exec(value);
      if ( mats ) {
        var sub_re = RegExp(mats[1],'g');
        this.highlight_regions = [];
        let smats;
        do {
          smats = sub_re.exec(this.sequence);
          if ( smats ){
            this.highlight_regions.push( [smats.index, smats.index + mats[1].length] );
          }
        } while(smats);
      }
      this.decorateText();
   }

}
