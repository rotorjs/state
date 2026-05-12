import { EmitterEvent } from './EmitterEvent';

export class RegisterReducerEvent<ReducerInit> extends EmitterEvent {
  #id;
  #init;

  constructor(id: string, init: ReducerInit) {
    super('register-reducer');

    this.#id = id;
    this.#init = init;
  }

  get id() {
    return this.#id;
  }

  get init() {
    return this.#init;
  }
}
