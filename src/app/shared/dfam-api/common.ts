import { Observable } from 'rxjs';
import { Family, Classification, Taxon } from './types';

export interface FamilyCriteria {
  name_accession?: string;
  classification?: string;
  clade?: string;
  clade_ancestors?: boolean;
  clade_descendants?: boolean;
  keywords?: string;
  sort?: string;

  start?: number;
  limit?: number;
}

export interface FamilyResults {
  results: Family[];
  total_count: number;
}

export interface FamilyRepository {
  getFamilies(criteria: FamilyCriteria): Observable<FamilyResults>;
  getFamiliesDownloadUrl(criteria: FamilyCriteria, format: string): string;
}

export interface ClassesRepository {
  getClasses(name?: string): Observable<Classification | Classification[]>;
}

export interface TaxaResults {
  taxa: Taxon[];
}

export interface TaxaRepository {
  getTaxa(name: string): Observable<TaxaResults>;
  getTaxonById(id: number): Observable<Taxon>;
}
