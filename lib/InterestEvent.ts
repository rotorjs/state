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

export function getContextInterest<ContextMap>(
  name: Extract<keyof ContextMap, string>,
): string {
  return `context:${name}`;
}

export class ContextInterestEvent<ContextMap> extends InterestEvent {
  constructor(name: Extract<keyof ContextMap, string>) {
    super(getContextInterest(name));
  }
}
