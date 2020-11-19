import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'dfam-dna-termini',
  templateUrl: './dna-termini.component.html',
  styleUrls: ['./dna-termini.component.scss']
})
export class DnaTerminiComponent {

  // This list is generated by Dfam-umbrella/Server/generateTerminiObj.py. It
  // includes section headings and subclass data including name, count of
  // families, whether to include each of the termini, 5', and 3' images, and
  // notes.

  // tslint:disable-next-line
  SUBCLASSES = [{"section": "Circular dsDNA Intermediate"}, {"name": "Crypton_A", "count": 60, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_C", "count": 5, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_F", "count": 22, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_H", "count": 7, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_I", "count": 9, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_R", "count": 6, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_S", "count": 59, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Crypton_V", "count": 40, "termini": true, "begins": true, "ends": true, "notes": ""}, {"section": "DNA Polymerase"}, {"name": "Maverick", "count": 112, "termini": true, "begins": true, "ends": true, "notes": ""}, {"section": "Rolling Circle"}, {"name": "Helitron", "count": 930, "termini": true, "begins": true, "ends": true, "notes": ""}, {"section": "Terminal Inverted Repeat"}, {"name": "Academ_1", "count": 85, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Academ_2", "count": 3, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Academ_H", "count": 18, "termini": true, "begins": true, "ends": true, "notes": "First C is likely part of the target site that favors CC<cut>."}, {"name": "CMC_Chapaev", "count": 46, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "CMC_Chapaev_3", "count": 48, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "CMC_EnSpm", "count": 609, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "CMC_Mirage", "count": 5, "termini": true, "begins": true, "ends": true, "notes": "Could be multiple groups here.  Too few families to tell yet."}, {"name": "CMC_Transib", "count": 118, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Dada", "count": 29, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Ginger", "count": 60, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT combined", "count": 3084, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Ac", "count": 823, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Blackjack", "count": 130, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Charlie", "count": 729, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Pegasus", "count": 7, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Restless", "count": 4, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Tag1", "count": 158, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_Tip100", "count": 705, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hAT1", "count": 6, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hAT5", "count": 33, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hAT6", "count": 8, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hAT19", "count": 81, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hATm", "count": 140, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hATw", "count": 15, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hATx", "count": 26, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "hAT_hobo", "count": 40, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "IS3EU", "count": 24, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Kolobok_E", "count": 8, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Kolobok_H", "count": 6, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Kolobok_Hydra", "count": 70, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Kolobok_T2", "count": 153, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "MULE_F", "count": 12, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "MULE_MuDR", "count": 1485, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "MULE_NOF", "count": 25, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Merlin", "count": 79, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Novosib", "count": 8, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "P", "count": 188, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "P_Fungi", "count": 16, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "PIF_Harbinger", "count": 1093, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "PIF_HarbS", "count": 21, "termini": true, "begins": true, "ends": true, "notes": "Consensus probably starts with GGGC like other Harbingers; the T could be part of a TSD."}, {"name": "PIF_ISL2EU", "count": 44, "termini": true, "begins": true, "ends": true, "notes": "Low signal in our dataset.  Han et al. (PMID26120370) has an alternative LOGO."}, {"name": "PIF_Spy", "count": 56, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "PiggyBac", "count": 310, "termini": true, "begins": true, "ends": true, "notes": "After removal of TTAA TSDs for many families.  There appear to be subgroups with CACGTT\u2026, CACTA\u2026 and CTAGTGTCTA termini."}, {"name": "PiggyBac_A", "count": 4, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "PiggyBac_X", "count": 43, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Sola_1", "count": 119, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Sola_2", "count": 89, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Sola_3", "count": 28, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar combined", "count": 2624, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Ant1", "count": 20, "termini": true, "begins": true, "ends": true, "notes": "Appears to be two groups present (TA TSDs removed) in this subclass.  One with a CAGCTATT motif and another with TTGTGTTT."}, {"name": "TcMar_Cweed", "count": 26, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Fot1", "count": 220, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Gizmo", "count": 3, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_ISRm11", "count": 109, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_m44", "count": 45, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Mariner", "count": 457, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Mogwai", "count": 3, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Pogo", "count": 120, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Sagan", "count": 34, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Stowaway", "count": 152, "termini": true, "begins": true, "ends": true, "notes": "The majority (102) start with CTCCCTC.., but the TA may be part of the TIR as many TA...TA consensi are annotated to have TA TSDs."}, {"name": "TcMar_Tc1", "count": 924, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Tc2", "count": 108, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Tc4", "count": 58, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "TcMar_Tigger", "count": 310, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Zator", "count": 51, "termini": true, "begins": true, "ends": true, "notes": ""}, {"name": "Zisupton", "count": 22, "termini": true, "begins": true, "ends": true, "notes": ""}];

  displayColumns = ['name', 'count', 'termini', 'begins', 'ends', 'notes'];

  @ViewChild('popup') popupTemplate: TemplateRef<any>;

  constructor(private dialog: MatDialog) { }

  getImagePath(subclassName, part) {
    return '/assets/images/termini/' + subclassName.replace(/ /g, '') + part + '.svg';
  }

  openBigLogo(path) {
    this.dialog.open(this.popupTemplate, {
      data: {
        path,
      },
    });
  }

  isSectionHeading(index, data) {
    if (data.section) {
      return true;
    } else {
      return undefined;
    }
  }

}
