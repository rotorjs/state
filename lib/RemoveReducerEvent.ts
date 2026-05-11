export class RemoveReducerEvent extends Event {
  #id;

  constructor(id: string) {
    super('remove-reducer');

    this.#id = id;
  }

  get id() {
    return this.#id;
  }
}
