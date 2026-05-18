import { EmitterEvent } from './EmitterEvent';

export class UnsubscribeStateEvent<StateDescriptor> extends EmitterEvent {
  #consumer;
  #descriptor;

  constructor(consumer: string, descriptor: StateDescriptor) {
    super('unsubscribe-state');

    this.#consumer = consumer;
    this.#descriptor = descriptor;
  }

  get consumer() {
    return this.#consumer;
  }

  get descriptor() {
    return this.#descriptor;
  }
}
