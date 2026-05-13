import { v7 as uuid } from 'uuid';
import { ActionEvent } from './ActionEvent';
import { InterestEvent } from './InterestEvent';
import { RegisterReducerEvent } from './RegisterReducerEvent';
import { RemoveReducerEvent } from './RemoveReducerEvent';
import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';

type ActionEventMessage = { type: `${string}:action`; action: unknown };

type InterestEventMessage = { type: `${string}:interest`; interest: string };

type RegisterReducerEventMessage = {
  type: `${string}:register-reducer`;
  id: string;
  init: unknown;
};

type RemoveReducerEventMessage = {
  type: `${string}:remove-reducer`;
  id: string;
};

type StateEventMessage = {
  type: `${string}:state`;
  id: string;
  state: unknown;
};

type EventMessage =
  | ActionEventMessage
  | InterestEventMessage
  | RegisterReducerEventMessage
  | RemoveReducerEventMessage
  | StateEventMessage;

export type AttachStateEventTargetOptions = {
  signal?: AbortSignal;
  messagePrefix?: string;
};

export function attachStateEventTarget<T>(
  target: StateEventTarget<unknown, unknown, unknown>,
  addEventListener: MessageEventTarget<T>['addEventListener'],
  postMessage: (message: unknown, transfer?: Transferable[]) => void,
  options?: AttachStateEventTargetOptions,
): void {
  const emitterID = uuid();
  const signal = options?.signal;
  const messagePrefix = options?.messagePrefix ?? 'rotorjs:';

  target.addEventListener(
    'action',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        type: `${messagePrefix}:action`,
        action: event.action,
      } satisfies EventMessage);
    },
    { signal },
  );

  target.addEventListener(
    'interest',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        type: `${messagePrefix}:interest`,
        interest: event.interest,
      } satisfies EventMessage);
    },
    { signal },
  );

  target.addEventListener(
    'register-reducer',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        type: `${messagePrefix}:register-reducer`,
        id: event.id,
        init: event.init,
      } satisfies EventMessage);
    },
    { signal },
  );

  target.addEventListener(
    'remove-reducer',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        type: `${messagePrefix}:remove-reducer`,
        id: event.id,
      } satisfies EventMessage);
    },
    { signal },
  );

  target.addEventListener(
    'state',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        type: `${messagePrefix}:state`,
        id: event.id,
        state: event.state,
      } satisfies EventMessage);
    },
    { signal },
  );

  addEventListener(
    'message',
    (event) => {
      const message: EventMessage = event.data;

      switch (message.type) {
        case `${messagePrefix}:action`: {
          const m = message as ActionEventMessage;
          const e = new ActionEvent(m.action);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case `${messagePrefix}:interest`: {
          const m = message as InterestEventMessage;
          const e = new InterestEvent(m.interest);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case `${messagePrefix}:register-reducer`: {
          const m = message as RegisterReducerEventMessage;
          const e = new RegisterReducerEvent(m.id, m.init);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case `${messagePrefix}:remove-reducer`: {
          const m = message as RemoveReducerEventMessage;
          const e = new RemoveReducerEvent(m.id);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case `${messagePrefix}:state`: {
          const m = message as StateEventMessage;
          const e = new StateEvent(m.id, m.state);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }
      }
    },
    { signal },
  );
}

export interface WorkerLike<T> extends MessageEventTarget<T> {
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

export function attachWorker<T>(
  target: StateEventTarget<unknown, unknown, unknown>,
  worker: WorkerLike<T>,
  options?: AttachStateEventTargetOptions,
): void {
  attachStateEventTarget(
    target,
    worker.addEventListener.bind(worker),
    worker.postMessage.bind(worker),
    options,
  );
}

export function wrapWorker<State, ReducerInit, Action, T>(
  worker: WorkerLike<T>,
  options?: AttachStateEventTargetOptions,
): StateEventTarget<State, ReducerInit, Action> {
  const target = new StateEventTarget<State, ReducerInit, Action>();
  attachWorker(
    target as StateEventTarget<unknown, unknown, unknown>,
    worker,
    options,
  );
  return target;
}
