import { stateInterest } from './interests';
import { StateEventTarget } from './StateEventTarget';

export abstract class StateReducer<
  StateDescriptor,
  State,
  Action,
  Engine extends StateEngine<StateDescriptor, State, Action> = StateEngine<
    StateDescriptor,
    State,
    Action
  >,
> {
  #engine;
  #id;
  #consumers: { [id: string]: boolean } = {};
  #interests: { [interest: string]: boolean } = {};
  #hasState = false;
  #state: State | undefined;
  #debounce = 0;
  #pending = false;
  #queue: Promise<void> = Promise.resolve();
  #controller = new AbortController();

  constructor(engine: Engine, descriptor: StateDescriptor) {
    this.#engine = engine;
    this.#id = this.engine.getReducerID(descriptor);

    const signal = this.signal;

    this.engine.addEventListener(
      'interest',
      (event) => {
        if (this.hasInterest(event.interest)) this.update();
      },
      { signal },
    );
  }

  get engine(): Engine {
    return this.#engine;
  }

  get debounce(): number {
    return this.#debounce;
  }

  get signal(): AbortSignal {
    return AbortSignal.any([this.#controller.signal, this.engine.signal]);
  }

  addConsumer(consumer: string): void {
    this.#consumers[consumer] = true;

    if (!this.signal.aborted && this.#hasState)
      setTimeout(() => {
        if (this.hasConsumer(consumer))
          this.engine.dispatchState([consumer], this.#state!);
      });
  }

  hasConsumer(consumer: string): boolean {
    return Object.hasOwn(this.#consumers, consumer);
  }

  getConsumers(): string[] {
    return Object.keys(this.#consumers);
  }

  removeConsumer(consumer: string): boolean {
    return delete this.#consumers[consumer];
  }

  clearConsumers(): void {
    this.#consumers = {};
  }

  addInterest(interest: string): void {
    this.#interests[interest] = true;
  }

  hasInterest(interest: string): boolean {
    return Object.hasOwn(this.#interests, interest);
  }

  getInterests(): string[] {
    return Object.keys(this.#interests);
  }

  removeInterest(interest: string): boolean {
    return delete this.#interests[interest];
  }

  clearInterests(): void {
    this.#interests = {};
  }

  setDebounce(debounce: number): void {
    this.#debounce = debounce;
  }

  update(): void {
    if (this.#pending) return;

    this.#pending = true;

    this.#queue = this.#queue.then<void>(async () => {
      await new Promise((resolve) => {
        // The timeout is needed to allow other events to be processed between updates.
        // Also, we can set an optional debounce here to reduce unnecessary redundant updates.
        setTimeout(resolve, this.#debounce);
      });

      this.#pending = false;

      if (this.signal.aborted) return;

      let nextState: State;
      try {
        nextState = await this.reduce(this.#state);
      } catch (error) {
        nextState = this.recover(this.#state, error);
      }

      if (
        this.signal.aborted ||
        (this.#hasState && this.compareStates(nextState, this.#state!))
      )
        return;

      this.#hasState = true;
      this.#state = nextState;
      this.onState(nextState);
    });
  }

  abstract reduce(prevState: State | undefined): State | Promise<State>;

  abstract recover(prevState: State | undefined, error: unknown): State;

  protected compareStates(nextState: State, prevState: State): boolean {
    return nextState === prevState;
  }

  protected onState(state: State): void {
    setTimeout(() => {
      this.engine.dispatchState(this.getConsumers(), state);
      this.engine.dispatchInterest(stateInterest(this.#id));
    });
  }

  stop(): void {
    this.#controller.abort();
  }
}

export abstract class StateEngine<
  StateDescriptor,
  State,
  Action,
> extends StateEventTarget<StateDescriptor, State, Action> {
  #reducers: {
    [id: string]: StateReducer<StateDescriptor, State, Action>;
  } = {};
  #controller = new AbortController();

  constructor() {
    super();

    const signal = this.signal;

    this.addEventListener(
      'action',
      (event) => {
        this.onAction(event.action);
      },
      { signal },
    );

    this.addEventListener(
      'subscribe-state',
      (event) => {
        const id = this.getReducerID(event.descriptor);

        if (!Object.hasOwn(this.#reducers, id)) {
          const reducer = this.createReducer(event.descriptor);
          this.#reducers[id] = reducer;
        }

        this.#reducers[id].addConsumer(event.consumer);
      },
      { signal },
    );

    this.addEventListener(
      'unsubscribe-state',
      (event) => {
        const id = this.getReducerID(event.descriptor);

        if (!Object.hasOwn(this.#reducers, id)) return;

        const reducer = this.#reducers[id];

        if (!reducer.removeConsumer(event.consumer)) return;

        if (!reducer.getConsumers().length) {
          setTimeout(() => {
            if (reducer.getConsumers().length || this.#reducers[id] !== reducer)
              return;

            delete this.#reducers[id];
            reducer.stop();
          });
        }
      },
      { signal },
    );
  }

  get signal(): AbortSignal {
    return this.#controller.signal;
  }

  abstract getReducerID(descriptor: StateDescriptor): string;

  protected abstract createReducer(
    descriptor: StateDescriptor,
  ): StateReducer<StateDescriptor, State, Action>;

  protected onAction(_action: Action): void {}

  stop(): void {
    this.#controller.abort();
  }
}
