import { StateEngine, StateReducer, type StateEventTarget } from '@/main';

export type DemoState =
  | 'demo state'
  | 'updated demo state'
  | 'other demo state'
  | 'extended demo state';

export type DemoReducerInit = { other: boolean };

export type DemoAction = 'demo action' | 'stop';

export type DemoStateEventTarget = StateEventTarget<
  DemoState,
  DemoReducerInit,
  DemoAction
>;

export class DemoStateReducer extends StateReducer<
  DemoState,
  DemoReducerInit,
  DemoAction,
  DemoStateEngine
> {
  #other: boolean;

  constructor(
    engine: DemoStateEngine,
    other: boolean,
    callback: (state: DemoState) => void,
  ) {
    super(engine, 'demo state', callback);

    this.#other = other;

    this.update();
  }

  async reduce(_prevState: DemoState): Promise<DemoState> {
    console.log('reduce');

    this.clearInterests();

    this.engine.dispatchAction('demo action');

    this.addInterest('demo interest');

    return this.engine.getState(this.#other);
  }

  recover(_prevState: DemoState, error: unknown): DemoState {
    throw error;
  }
}

export class DemoStateEngine extends StateEngine<
  DemoState,
  DemoReducerInit,
  DemoAction
> {
  constructor() {
    super();

    const signal = this.signal;

    this.addEventListener(
      'action',
      () => {
        setTimeout(() => {
          this.dispatchInterest('demo interest');
        }, 5000);
      },
      { signal },
    );
  }

  getState(other: boolean): DemoState {
    return other ? 'other demo state' : 'updated demo state';
  }

  protected createReducer(
    init: DemoReducerInit,
    callback: (state: DemoState) => void,
  ): StateReducer<DemoState, DemoReducerInit, 'demo action' | 'stop'> {
    return new DemoStateReducer(this, init.other, callback);
  }
}

export class ExtendedDemoStateEngine extends DemoStateEngine {
  getState(other: boolean): DemoState {
    if (other) return super.getState(other);
    return 'extended demo state';
  }
}
