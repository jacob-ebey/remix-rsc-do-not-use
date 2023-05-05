describe("template spec", () => {
  it("passes", () => {
    cy.request("http://localhost:3001").then((response) => {
      console.log(response.headers);
      expect(response.headers).to.have.property(
        "content-type",
        "text/x-component; charset=utf-8"
      );
    });
  });
});
