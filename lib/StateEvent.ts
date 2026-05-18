import { EmitterEvent } from './EmitterEvent';

export class StateEvent<State> extends EmitterEvent {
  #consumers;
  #state;

  constructor(consumers: string[], state: State) {
    super('state');

    this.#consumers = consumers;
    this.#state = state;
  }

  get consumers() {
    return this.#consumers;
  }

  get state() {
    return this.#state;
  }
}
