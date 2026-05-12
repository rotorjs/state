import { StateEventTarget } from './StateEventTarget';

export type StateReducerOptions = {
  debounce?: number;
};

export abstract class StateReducer<
  State,
  ReducerInit,
  Action,
  Engine extends StateEngine<State, ReducerInit, Action> = StateEngine<
    State,
    ReducerInit,
    Action
  >,
> {
  #engine;
  #queue: Promise<State>;
  #callback;
  #interests: { [interest: string]: boolean } = {};
  #pending = false;
  #debounce;
  #controller = new AbortController();

  constructor(
    engine: Engine,
    initialState: State,
    callback: (state: State) => void,
    options?: StateReducerOptions,
  ) {
    this.#engine = engine;
    this.#queue = Promise.resolve(initialState);
    this.#callback = callback;
    this.#debounce = options?.debounce;

    const signal = this.signal;

    this.#engine.addEventListener(
      'interest',
      (event) => {
        if (Object.hasOwn(this.#interests, event.interest)) {
          this.update();
        }
      },
      { signal },
    );

    this.#callback(initialState);
  }

  get engine() {
    return this.#engine;
  }

  get signal() {
    return this.#controller.signal;
  }

  addInterest(interest: string): void {
    if (!Object.hasOwn(this.#interests, interest)) {
      this.#interests[interest] = true;
    }
  }

  removeInterest(interest: string): void {
    delete this.#interests[interest];
  }

  getInterests(): string[] {
    return Object.keys(this.#interests);
  }

  clearInterests(): void {
    this.#interests = {};
  }

  update(): void {
    if (this.#pending) return;

    this.#pending = true;

    if (this.#debounce && this.#debounce > 0) {
      this.#queue = this.#queue.then<State>(
        (state) =>
          new Promise((resolve) => {
            setTimeout(() => resolve(state), this.#debounce);
          }),
      );
    }

    this.#queue = this.#queue.then<State>(async (prevState) => {
      this.#pending = false;

      if (this.signal.aborted) return prevState;

      let nextState: State;
      try {
        nextState = await this.reduce(prevState);
      } catch (error) {
        nextState = this.recover(prevState, error);
      }

      if (this.signal.aborted) return prevState;

      if (nextState !== prevState) {
        this.#callback(nextState);
      }

      return nextState;
    });
  }

  abstract reduce(prevState: State): Promise<State>;

  abstract recover(prevState: State, error: unknown): State;

  stop(): void {
    this.#controller.abort();
  }
}

export abstract class StateEngine<
  State,
  ReducerInit,
  Action,
> extends StateEventTarget<State, ReducerInit, Action> {
  #reducers: {
    [id: string]: StateReducer<State, ReducerInit, Action>;
  } = {};
  #controller = new AbortController();

  constructor() {
    super();

    const signal = this.signal;

    this.addEventListener(
      'register-reducer',
      (event) => {
        if (Object.hasOwn(this.#reducers, event.id)) {
          this.#reducers[event.id].stop();
        }

        this.#reducers[event.id] = this.createReducer(event.init, (state) => {
          setTimeout(() => this.dispatchState(event.id, state));
        });
      },
      { signal },
    );

    this.addEventListener(
      'remove-reducer',
      (event) => {
        if (Object.hasOwn(this.#reducers, event.id)) {
          this.#reducers[event.id].stop();
          delete this.#reducers[event.id];
        }
      },
      { signal },
    );
  }

  get signal() {
    return this.#controller.signal;
  }

  protected abstract createReducer(
    init: ReducerInit,
    callback: (state: State) => void,
  ): StateReducer<State, ReducerInit, Action>;

  stop(): void {
    this.#controller.abort();
  }
}
