import { ActionEvent } from './ActionEvent';
import { InterestEvent } from './InterestEvent';
import { RegisterReducerEvent } from './RegisterReducerEvent';
import { RemoveReducerEvent } from './RemoveReducerEvent';
import { StateEvent } from './StateEvent';
import { TypedEventTarget } from './TypedEventTarget';

export class StateEventTarget<
  State,
  ReducerInit,
  Action,
> extends TypedEventTarget<{
  action: ActionEvent<Action>;
  interest: InterestEvent;
  'register-reducer': RegisterReducerEvent<ReducerInit>;
  'remove-reducer': RemoveReducerEvent;
  state: StateEvent<State>;
}> {
  dispatchAction(action: Action): void {
    this.dispatchEvent(new ActionEvent(action));
  }

  dispatchInterest(interest: string): void {
    this.dispatchEvent(new InterestEvent(interest));
  }

  registerReducer(id: string, init: ReducerInit): void {
    this.dispatchEvent(new RegisterReducerEvent(id, init));
  }

  removeReducer(id: string): void {
    this.dispatchEvent(new RemoveReducerEvent(id));
  }

  dispatchState(id: string, state: State): void {
    this.dispatchEvent(new StateEvent(id, state));
  }
}
