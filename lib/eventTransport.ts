import { v7 as uuid } from 'uuid';
import { ActionEvent } from './ActionEvent';
import { InterestEvent } from './InterestEvent';
import { RegisterReducerEvent } from './RegisterReducerEvent';
import { RemoveReducerEvent } from './RemoveReducerEvent';
import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';

type EventMessage =
  | {
      rotorEventTarget: string;
      type: 'action';
      action: unknown;
    }
  | {
      rotorEventTarget: string;
      type: 'interest';
      interest: string;
    }
  | {
      rotorEventTarget: string;
      type: 'register-reducer';
      id: string;
      init: unknown;
    }
  | {
      rotorEventTarget: string;
      type: 'remove-reducer';
      id: string;
    }
  | {
      rotorEventTarget: string;
      type: 'state';
      id: string;
      state: unknown;
    };

export type AttachStateEventTargetOptions = {
  signal?: AbortSignal;
  eventTargetID?: string;
};

export function attachStateEventTarget<T>(
  target: StateEventTarget<unknown, unknown, unknown>,
  addEventListener: MessageEventTarget<T>['addEventListener'],
  postMessage: (message: unknown, transfer?: Transferable[]) => void,
  options?: AttachStateEventTargetOptions,
): void {
  const emitterID = uuid();
  const rotorEventTarget = options?.eventTargetID ?? 'rotorjs';
  const signal = options?.signal;

  target.addEventListener(
    'action',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        rotorEventTarget,
        type: 'action',
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
        rotorEventTarget,
        type: 'interest',
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
        rotorEventTarget,
        type: 'register-reducer',
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
        rotorEventTarget,
        type: 'remove-reducer',
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
        rotorEventTarget,
        type: 'state',
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
      if (message.rotorEventTarget !== rotorEventTarget) return;

      switch (message.type) {
        case 'action': {
          const e = new ActionEvent(message.action);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'interest': {
          const e = new InterestEvent(message.interest);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'register-reducer': {
          const e = new RegisterReducerEvent(message.id, message.init);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'remove-reducer': {
          const e = new RemoveReducerEvent(message.id);
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'state': {
          const e = new StateEvent(message.id, message.state);
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
  attachWorker(target, worker, options);
  return target;
}
