import type { ContextEvent } from './ContextEvent';
import type { InterestEvent } from './InterestEvent';
import type { RegisterReducerEvent } from './RegisterReducerEvent';
import type { RemoveReducerEvent } from './RemoveReducerEvent';
import type { StateEvent } from './StateEvent';
import { TypedEventTarget } from './TypedEventTarget';

export class StateEventTarget<
  State,
  ReducerInit,
  ContextUpdate,
> extends TypedEventTarget<{
  context: ContextEvent<ContextUpdate>;
  interest: InterestEvent;
  'register-reducer': RegisterReducerEvent<ReducerInit>;
  'remove-reducer': RemoveReducerEvent;
  state: StateEvent<State>;
}> {}
