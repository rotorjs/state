import { ContextEvent } from './ContextEvent';
import { InterestEvent } from './InterestEvent';
import { RegisterReducerEvent } from './RegisterReducerEvent';
import { RemoveReducerEvent } from './RemoveReducerEvent';
import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';

export interface MessageTarget<T> extends MessageEventTarget<T> {
  postMessage(message: any): void;
}

export type MessageTargetEventOptions = {
  signal?: AbortSignal;
};

export function attachMessageEventTarget<T>(
  target: StateEventTarget<unknown, unknown, unknown>,
  messageTarget: MessageTarget<T>,
  options?: MessageTargetEventOptions,
): void {
  const signal = options?.signal;

  target.addEventListener(
    'context',
    (event) => {
      messageTarget.postMessage({ type: 'context', value: event.value });
    },
    { signal },
  );

  target.addEventListener(
    'interest',
    (event) => {
      messageTarget.postMessage({ type: 'interest', interest: event.interest });
    },
    { signal },
  );

  target.addEventListener(
    'register-reducer',
    (event) => {
      messageTarget.postMessage({
        type: 'register-reducer',
        id: event.id,
        init: event.init,
      });
    },
    { signal },
  );

  target.addEventListener(
    'remove-reducer',
    (event) => {
      messageTarget.postMessage({
        type: 'remove-reducer',
        id: event.id,
      });
    },
    { signal },
  );

  target.addEventListener(
    'state',
    (event) => {
      messageTarget.postMessage({
        type: 'state',
        id: event.id,
        state: event.state,
      });
    },
    { signal },
  );

  messageTarget.addEventListener(
    'message',
    (event) => {
      switch (event.data.type) {
        case 'context':
          target.dispatchEvent(new ContextEvent(event.data.value));
          return;

        case 'context':
          target.dispatchEvent(new InterestEvent(event.data.interest));
          return;

        case 'register-reducer':
          target.dispatchEvent(
            new RegisterReducerEvent(event.data.id, event.data.init),
          );
          return;

        case 'remove-reducer':
          target.dispatchEvent(new RemoveReducerEvent(event.data.id));
          return;

        case 'state':
          target.dispatchEvent(new StateEvent(event.data.id, event.data.state));
          return;
      }
    },
    { signal },
  );
}

export function wrapMessageEventTarget<State, ReducerInit, ContextValue, T>(
  messageTarget: MessageTarget<T>,
  options?: MessageTargetEventOptions,
): StateEventTarget<State, ReducerInit, ContextValue> {
  const target = new StateEventTarget<State, ReducerInit, ContextValue>();
  attachMessageEventTarget(
    target as StateEventTarget<unknown, unknown, unknown>,
    messageTarget,
    options,
  );
  return target;
}
