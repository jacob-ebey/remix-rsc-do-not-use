describe("fixture", () => {
  it("returns html", () => {
    cy.request("http://localhost:3000").then((response) => {
      expect(response.headers).to.have.property(
        "content-type",
        "text/html; charset=utf-8"
      );
    });
  });
  it("returns component", () => {
    cy.request("http://localhost:3000?_rsc=1").then((response) => {
      expect(response.headers).to.have.property(
        "content-type",
        "text/x-component; charset=utf-8"
      );
    });
  });
});
