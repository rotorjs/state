import { attachMessageEventTarget, StateEngine, StateReducer } from '@/main';

class DemoStateReducer<State, ReducerInit, ContextMap> extends StateReducer<
  State,
  ReducerInit,
  ContextMap
> {
  async reduce(_prevState: State): Promise<State> {
    return undefined as State;
  }

  recover(prevState: State, _error: unknown): State {
    return prevState;
  }
}

const engine = new StateEngine({
  createReducer: (engine, init, callback) =>
    new DemoStateReducer<unknown, unknown, unknown>(engine, init, callback),
});
attachMessageEventTarget(engine, parent);
