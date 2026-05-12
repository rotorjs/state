import { EmitterEvent } from './EmitterEvent';

export class RemoveReducerEvent extends EmitterEvent {
  #id;

  constructor(id: string) {
    super('remove-reducer');

    this.#id = id;
  }

  get id() {
    return this.#id;
  }
}
