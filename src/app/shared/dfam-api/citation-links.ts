// Links for citations and authors returned by the Dfam API.
//
// A citation's doi is either a real DOI (starting with "10.") or a
// placeholder: "PMID:<pmid>" when Dfam has a PubMed ID for the article but
// no DOI, or "NOREF:<n>" when Dfam has neither. We link only real DOIs to
// doi.org.

export function isRealDoi(doi: string): boolean {
  return !!doi && doi.startsWith('10.');
}

export function doiUrl(doi: string): string {
  return 'https://doi.org/' + doi;
}

export function pubmedUrl(pmid: number): string {
  return 'https://pubmed.ncbi.nlm.nih.gov/' + pmid + '/';
}

export function orcidUrl(orcid: string): string {
  return 'https://orcid.org/' + orcid;
}
