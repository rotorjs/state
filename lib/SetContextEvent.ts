export class SetContextEvent<ContextMap> extends Event {
  #name;
  #value;

  constructor(
    name: Extract<keyof ContextMap, string>,
    value: ContextMap[typeof name],
  ) {
    super('set-context');

    this.#name = name;
    this.#value = value;
  }

  get name() {
    return this.#name;
  }

  get value() {
    return this.#value;
  }
}
