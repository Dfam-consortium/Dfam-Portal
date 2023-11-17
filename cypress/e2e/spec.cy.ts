describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('http://dfam-dev:10101')

    cy.url().should('include', '/home')
  })
})