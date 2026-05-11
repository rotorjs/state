export class ContextEvent<ContextValue> extends Event {
  #value;

  constructor(value: ContextValue) {
    super('context');

    this.#value = value;
  }

  get value() {
    return this.#value;
  }
}
