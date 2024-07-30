export class InternalServerError extends Error {
  constructor() {
    super();
    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = "Internal server error has occurred.";
  }
}
