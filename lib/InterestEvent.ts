export class InterestEvent extends Event {
  #interest;

  constructor(interest: string) {
    super('interest');

    this.#interest = interest;
  }

  get interest() {
    return this.#interest;
  }
}
