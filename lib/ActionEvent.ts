import { EmitterEvent } from './EmitterEvent';

export class ActionEvent<Action> extends EmitterEvent {
  #action;

  constructor(action: Action) {
    super('action');

    this.#action = action;
  }

  get action() {
    return this.#action;
  }
}
