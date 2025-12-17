describe('Notes App', () => {
  it('signs up, logs in, creates, locks, favorites, and deletes a note', () => {
    cy.visit('/signup');
    cy.get('input[name=username]').type('e2euser');
    cy.get('input[name=email]').type('e2e@example.com');
    cy.get('input[name=password]').type('123456');
    cy.get('button[type=submit]').click();

    cy.visit('/login');
    cy.get('input[name=email]').type('e2e@example.com');
    cy.get('input[name=password]').type('123456');
    cy.get('button[type=submit]').click();

    cy.contains('New Note').click();
    cy.get('input[name=title]').type('E2E Note');
    cy.get('textarea[name=content]').type('E2E Content');
    cy.contains('Save').click();
    cy.contains('E2E Note').should('exist');

    cy.contains('Lock').click();
    cy.get('input[name=password]').type('4321');
    cy.contains('Unlock').click();

    cy.contains('Add to Favorites').click();
    cy.contains('Favorite').should('exist');

    cy.contains('Delete').click();
    cy.contains('E2E Note').should('not.exist');
  });
});
