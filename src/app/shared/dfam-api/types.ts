export class Family {
  accession: string;
  name: string;
  title: string;
  version: number;
  description: string;
  length: number;
  classification: string;
  repeat_type_name?: string;
  repeat_subtype_name?: string;
  consensus_sequence: string;
  author: string;
  date_created: string;
  date_modified: string;
  target_site_cons: string;
  refineable: boolean;
  disabled: boolean;
  model_mask: string;
  hmm_general_threshold: number;

  aliases: {database: string; alias: string}[];
  search_stages: {name: string}[];
  buffer_stages: {name: string; start: number; end: number}[];
  citations: {pmid: number; title: string; authors: string; journal: string; pubdate: string}[];
  clades: string[];
  features: any[];
  coding_seqs: any[];

  is_raw: boolean;
}

export class FamilySummary {
  accession: string;
  name: string;
  description: string;
  length: number;
  repeat_type_name?: string;
  repeat_subtype_name?: string;

  clades: string[];
}

export class Classification {
  id: number;
  name: string;
  full_name: string;
  children: Classification[];

  tooltip?: string;
  description?: string;
  hyperlink?: string;
  repeatmasker_type?: string;
  repeatmakser_subtype?: string;
  count?: string;
  aliases?: string;
}

export class Taxon {
  id: number;
  name: string;
}
