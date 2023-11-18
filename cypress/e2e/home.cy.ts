describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('http://dfam.org')
  })

  it('Search Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('SEARCH').click()
    .url().should('include', '/search')
  })

  it('Browse Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('BROWSE').click()
    .url().should('include', '/browse')
  })

  it('Classification Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('CLASSIFICATION').click()
    .url().should('include', '/classification')
  })

  it('Repository Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('REPOSITORY').click()
    .url().should('include', '/repository')
  })

  // it('Download Link', () => {
  //   cy.get('span[class="mdc-button__label"]').contains('DOWNLOAD').click()
  //   .url().should('include', '/releases')
  // })

  it('Publications Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('PUBLICATIONS').click()
    .url().should('include', '/publications')
  })

  it('Help Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('HELP').click()
    .url().should('include', '/help')
  })

  it('About Link', () => {
    cy.get('span[class="mdc-button__label"]').contains('ABOUT').click()
    .url().should('include', '/about')
  })
})