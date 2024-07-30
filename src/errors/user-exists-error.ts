export class UserExistsError extends Error {
  constructor() {
    super();
    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = "Username or email already exists.";
  }
}
