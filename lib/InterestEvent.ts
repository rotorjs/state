import { EmitterEvent } from './EmitterEvent';

export class InterestEvent extends EmitterEvent {
  #interest;

  constructor(interest: string) {
    super('interest');

    this.#interest = interest;
  }

  get interest() {
    return this.#interest;
  }
}
