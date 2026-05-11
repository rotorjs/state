import type { ContextEvent } from './ContextEvent';
import type { InterestEvent } from './InterestEvent';
import type { RegisterReducerEvent } from './RegisterReducerEvent';
import type { RemoveReducerEvent } from './RemoveReducerEvent';
import type { SetContextEvent } from './SetContextEvent';
import type { StateEvent } from './StateEvent';
import { TypedEventTarget } from './TypedEventTarget';

export class StateEventTarget<
  State,
  ReducerInit,
  ContextMap,
> extends TypedEventTarget<{
  context: ContextEvent<ContextMap>;
  interest: InterestEvent;
  'register-reducer': RegisterReducerEvent<ReducerInit>;
  'remove-reducer': RemoveReducerEvent;
  'set-context': SetContextEvent<ContextMap>;
  state: StateEvent<State>;
}> {}
