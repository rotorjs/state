import { v7 as uuid } from 'uuid';
import { ActionEvent } from './ActionEvent';
import { InterestEvent } from './InterestEvent';
import { StateEvent } from './StateEvent';
import { StateEventTarget } from './StateEventTarget';
import { SubscribeStateEvent } from './SubscribeStateEvent';
import { UnsubscribeStateEvent } from './UnsubscribeStateEvent';

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
      type: 'subscribe-state';
      consumer: string;
      descriptor: unknown;
    }
  | {
      rotorEventTarget: string;
      type: 'unsubscribe-state';
      consumer: string;
      descriptor: unknown;
    }
  | {
      rotorEventTarget: string;
      type: 'state';
      consumers: string[];
      state: unknown;
    }
  | { rotorEventTarget?: unknown; type: never };

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
    'subscribe-state',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        rotorEventTarget,
        type: 'subscribe-state',
        consumer: event.consumer,
        descriptor: event.descriptor,
      } satisfies EventMessage);
    },
    { signal },
  );

  target.addEventListener(
    'unsubscribe-state',
    (event) => {
      if (event.emitter === emitterID) return;
      postMessage({
        rotorEventTarget,
        type: 'unsubscribe-state',
        consumer: event.consumer,
        descriptor: event.descriptor,
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
        consumers: event.consumers,
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

        case 'subscribe-state': {
          const e = new SubscribeStateEvent(
            message.consumer,
            message.descriptor,
          );
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'unsubscribe-state': {
          const e = new UnsubscribeStateEvent(
            message.consumer,
            message.descriptor,
          );
          e.emitter = emitterID;
          target.dispatchEvent(e);
          return;
        }

        case 'state': {
          const e = new StateEvent(message.consumers, message.state);
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

export function wrapWorker<StateDescriptor, State, Action, T>(
  worker: WorkerLike<T>,
  options?: AttachStateEventTargetOptions,
): StateEventTarget<StateDescriptor, State, Action> {
  const target = new StateEventTarget<StateDescriptor, State, Action>();
  attachWorker(target, worker, options);
  return target;
}
