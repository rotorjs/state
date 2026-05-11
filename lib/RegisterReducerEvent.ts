export class RegisterReducerEvent<ReducerInit> extends Event {
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
