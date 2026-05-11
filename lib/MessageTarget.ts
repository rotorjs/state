import { ContextEvent } from './ContextEvent';
import { InterestEvent } from './InterestEvent';
import { RegisterReducerEvent } from './RegisterReducerEvent';
import { RemoveReducerEvent } from './RemoveReducerEvent';
import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';
import { v7 as uuid } from 'uuid';

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
  const id = uuid();
  const signal = options?.signal;

  target.addEventListener(
    'context',
    (event) => {
      if (event.emitter === id) return;
      messageTarget.postMessage({ type: 'context', update: event.update });
    },
    { signal },
  );

  target.addEventListener(
    'interest',
    (event) => {
      if (event.emitter === id) return;
      messageTarget.postMessage({ type: 'interest', interest: event.interest });
    },
    { signal },
  );

  target.addEventListener(
    'register-reducer',
    (event) => {
      if (event.emitter === id) return;
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
      if (event.emitter === id) return;
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
      if (event.emitter === id) return;
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
        case 'context': {
          const e = new ContextEvent(event.data.update);
          e.emitter = id;
          target.dispatchEvent(e);
          return;
        }

        case 'interest': {
          const e = new InterestEvent(event.data.interest);
          e.emitter = id;
          target.dispatchEvent(e);
          return;
        }

        case 'register-reducer': {
          const e = new RegisterReducerEvent(event.data.id, event.data.init);
          e.emitter = id;
          target.dispatchEvent(e);
          return;
        }

        case 'remove-reducer': {
          const e = new RemoveReducerEvent(event.data.id);
          e.emitter = id;
          target.dispatchEvent(e);
          return;
        }

        case 'state': {
          const e = new StateEvent(event.data.id, event.data.state);
          e.emitter = id;
          target.dispatchEvent(e);
          return;
        }
      }
    },
    { signal },
  );
}

export function wrapMessageEventTarget<State, ReducerInit, ContextUpdate, T>(
  messageTarget: MessageTarget<T>,
  options?: MessageTargetEventOptions,
): StateEventTarget<State, ReducerInit, ContextUpdate> {
  const target = new StateEventTarget<State, ReducerInit, ContextUpdate>();
  attachMessageEventTarget(
    target as StateEventTarget<unknown, unknown, unknown>,
    messageTarget,
    options,
  );
  return target;
}
