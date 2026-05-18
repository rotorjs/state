import { ActionEvent } from './ActionEvent';
import { InterestEvent } from './InterestEvent';
import { StateEvent } from './StateEvent';
import { SubscribeStateEvent } from './SubscribeStateEvent';
import { TypedEventTarget } from './TypedEventTarget';
import { UnsubscribeStateEvent } from './UnsubscribeStateEvent';

export class StateEventTarget<
  StateDescriptor,
  State,
  Action,
> extends TypedEventTarget<{
  action: ActionEvent<Action>;
  interest: InterestEvent;
  'subscribe-state': SubscribeStateEvent<StateDescriptor>;
  'unsubscribe-state': UnsubscribeStateEvent<StateDescriptor>;
  state: StateEvent<State>;
}> {
  dispatchAction(action: Action): void {
    this.dispatchEvent(new ActionEvent(action));
  }

  dispatchInterest(interest: string): void {
    this.dispatchEvent(new InterestEvent(interest));
  }

  subscribeState(consumer: string, descriptor: StateDescriptor): void {
    this.dispatchEvent(new SubscribeStateEvent(consumer, descriptor));
  }

  unsubscribeState(consumer: string, descriptor: StateDescriptor): void {
    this.dispatchEvent(new UnsubscribeStateEvent(consumer, descriptor));
  }

  dispatchState(consumers: string[], state: State): void {
    this.dispatchEvent(new StateEvent(consumers, state));
  }
}
