import "./commands";
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver") ||
      err.message.includes("ChunkLoadError")) {
    return false;
  }
});
