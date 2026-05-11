import type { Interest } from './InterestEvent';
import { StateEventTarget } from './StateEventTarget';

export interface MessageTarget<T> extends MessageEventTarget<T> {
  postMessage(message: any): void;
}

export type MessageTargetEventOptions = {
  signal?: AbortSignal;
};

export function attachMessageEventTarget<T>(
  _target: StateEventTarget<unknown, unknown, unknown, Interest>,
  _messageTarget: MessageTarget<T>,
  _options?: MessageTargetEventOptions,
): void {
  // const signal = options?.signal;
  // target.addEventListener(
  //   'test',
  //   (event) => {
  //     messageTarget.postMessage({ type: 'test', value: event.data });
  //   },
  //   { signal },
  // );
  // messageTarget.addEventListener(
  //   'message',
  //   (event) => {
  //     switch (event.data.type) {
  //       case 'test':
  //         target.dispatchTypedEvent(
  //           'test',
  //           new TestEvent(event.data.value),
  //         );
  //     }
  //   },
  //   { signal },
  // );
}

export function wrapMessageEventTarget<
  State,
  ReducerInit,
  ContextMap,
  InterestType extends Interest,
  T,
>(
  messageTarget: MessageTarget<T>,
  options?: MessageTargetEventOptions,
): StateEventTarget<State, ReducerInit, ContextMap, InterestType> {
  const target = new StateEventTarget<
    State,
    ReducerInit,
    ContextMap,
    InterestType
  >();
  attachMessageEventTarget(
    target as StateEventTarget<unknown, unknown, unknown, Interest>,
    messageTarget,
    options,
  );
  return target;
}
