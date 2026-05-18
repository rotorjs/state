import { StateEngine, StateReducer, type StateEventTarget } from '@/main';

export type DemoStateDescriptor = { other: boolean };

export type DemoState =
  | 'demo state'
  | 'other demo state'
  | `extended demo state ${string}`;

export type DemoAction = 'demo action' | 'stop';

export type DemoStateEventTarget = StateEventTarget<
  DemoStateDescriptor,
  DemoState,
  DemoAction
>;

export class DemoStateReducer extends StateReducer<
  DemoStateDescriptor,
  DemoState,
  DemoAction,
  DemoStateEngine
> {
  #other: boolean;

  constructor(
    engine: DemoStateEngine,
    other: boolean,
    callback: (state: DemoState) => void,
  ) {
    super(engine, callback);

    this.#other = other;

    this.update();
  }

  async reduce(): Promise<DemoState> {
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
  DemoStateDescriptor,
  DemoState,
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
    return other ? 'other demo state' : 'demo state';
  }

  protected getReducerID(descriptor: DemoStateDescriptor): string {
    return descriptor.other ? 'other reducer' : 'reducer';
  }

  protected createReducer(
    descriptor: DemoStateDescriptor,
    callback: (state: DemoState) => void,
  ): StateReducer<DemoStateDescriptor, DemoState, 'demo action' | 'stop'> {
    console.log('creating reducer:', this.getReducerID(descriptor));
    return new DemoStateReducer(this, descriptor.other, callback);
  }
}

export class ExtendedDemoStateEngine extends DemoStateEngine {
  #n = 0;

  getState(other: boolean): DemoState {
    if (other) return super.getState(other);
    return `extended demo state ${this.#n++}`;
  }
}
