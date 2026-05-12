import { EmitterEvent } from './EmitterEvent';

export class StateEvent<State> extends EmitterEvent {
  #id;
  #state;

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
