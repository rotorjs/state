export class StateEvent<State> extends Event {
  #id;
  #state;
  emitter?: string;

  constructor(id: string, state: State) {
    super('state');

    this.#id = id;
    this.#state = state;
  }

  get id() {
    return this.#id;
  }

  get state() {
    return this.#state;
  }
}
