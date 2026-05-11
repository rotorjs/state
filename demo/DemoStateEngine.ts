import { ContextEvent } from '@/ContextEvent';
import { InterestEvent } from '@/InterestEvent';
import {
  StateEngine,
  StateReducer,
  type CreateStateReducerFunction,
} from '@/StateEngine';
import type { StateEventTarget } from '@/StateEventTarget';

export type DemoState =
  | 'demo state'
  | 'other demo state'
  | 'updated demo state';

export type DemoReducerInit = { other: boolean };

export type DemoContextUpdate = 'demo context update';

export type DemoStateEventTarget = StateEventTarget<
  DemoState,
  DemoReducerInit,
  DemoContextUpdate
>;

export class DemoStateReducer extends StateReducer<
  DemoState,
  DemoReducerInit,
  DemoContextUpdate
> {
  constructor(
    engine: DemoStateEngine,
    initialState: DemoState,
    callback: (state: DemoState) => void,
  ) {
    super(engine, initialState, callback);

    this.update();
  }

  async reduce(prevState: DemoState): Promise<DemoState> {
    this.clearInterests();

    this.engine.dispatchEvent(new ContextEvent('demo context update'));

    this.addInterest('demo interest');

    return 'updated demo state';
  }

  recover(prevState: DemoState, _error: unknown): DemoState {
    return prevState;
  }
}

export function createDemoStateReducer(
  engine: DemoStateEngine,
  init: DemoReducerInit,
  callback: (state: DemoState) => void,
) {
  return new DemoStateReducer(
    engine,
    init.other ? 'other demo state' : 'demo state',
    callback,
  );
}

export class DemoStateEngine extends StateEngine<
  DemoState,
  DemoReducerInit,
  DemoContextUpdate
> {
  constructor(
    createReducer: CreateStateReducerFunction<
      DemoState,
      DemoReducerInit,
      DemoContextUpdate
    >,
  ) {
    super(createReducer);

    this.addEventListener('context', () => {
      setTimeout(() => {
        this.dispatchEvent(new InterestEvent('demo interest'));
      }, 1000);
    });
  }
}
