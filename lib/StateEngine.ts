import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';

export abstract class StateReducer<State, ReducerInit, ContextValue> {
  #engine;
  #queue: Promise<State>;
  #callback;
  #interests: { [interest: string]: boolean } = {};
  #pending = false;
  #controller = new AbortController();

  constructor(
    engine: StateEngine<State, ReducerInit, ContextValue>,
    initialState: State,
    callback: (state: State) => void,
  ) {
    this.#engine = engine;
    this.#queue = Promise.resolve(initialState);
    this.#callback = callback;

    const signal = this.#controller.signal;

    this.#engine.addEventListener(
      'interest',
      (event) => {
        if (Object.hasOwn(this.#interests, event.interest)) {
          this.update();
        }
      },
      { signal },
    );
  }

  get engine() {
    return this.#engine;
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

    this.#queue = this.#queue.then(async (prevState): Promise<State> => {
      this.#pending = false;

      if (this.#controller.signal.aborted) return prevState;

      let nextState: State;
      try {
        nextState = await this.reduce(prevState);
      } catch (error) {
        nextState = this.recover(prevState, error);
      }

      if (this.#controller.signal.aborted) return prevState;

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

export interface CreateStateReducerFunction<State, ReducerInit, ContextValue> {
  (
    engine: StateEngine<State, ReducerInit, ContextValue>,
    init: ReducerInit,
    callback: (state: State) => void,
  ): StateReducer<State, ReducerInit, ContextValue>;
}

export class StateEngine<
  State,
  ReducerInit,
  ContextValue,
> extends StateEventTarget<State, ReducerInit, ContextValue> {
  #createReducer;
  #reducers: {
    [id: string]: StateReducer<State, ReducerInit, ContextValue>;
  } = {};
  #controller = new AbortController();

  constructor(
    createReducer: CreateStateReducerFunction<State, ReducerInit, ContextValue>,
  ) {
    super();

    this.#createReducer = createReducer;

    const signal = this.#controller.signal;

    this.addEventListener(
      'register-reducer',
      (event) => {
        if (Object.hasOwn(this.#reducers, event.id)) {
          this.#reducers[event.id].stop();
        }

        this.#reducers[event.id] = this.#createReducer(
          this,
          event.init,
          (state) => {
            this.dispatchEvent(new StateEvent(event.id, state));
          },
        );
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

  stop(): void {
    this.#controller.abort();
  }
}
