export class ContextEvent<ContextUpdate> extends Event {
  #update;
  emitter?: string;

  constructor(update: ContextUpdate) {
    super('context');

    this.#update = update;
  }

  get update() {
    return this.#update;
  }
}
