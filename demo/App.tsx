import {
  RegisterReducerEvent,
  RemoveReducerEvent,
  wrapMessageEventTarget,
} from '@/main';
import { useEffect, useId } from 'react';
import './App.css';
import Worker from './worker?worker';
import type { DemoStateEventTarget } from './DemoStateEngine';

const worker = new Worker();
const engine: DemoStateEventTarget = wrapMessageEventTarget(worker);
// const engine = new DemoStateEngine(createDemoStateReducer);

engine.addEventListener('context', (event) => {
  alert('context ' + event.update);
});

engine.addEventListener('interest', (event) => {
  alert('interest ' + event.interest);
});

engine.addEventListener('state', (event) => {
  alert('state ' + event.id + ' ' + event.state);
});

export default function App() {
  const id = useId();
  const id2 = useId();

  useEffect(() => {
    engine.dispatchEvent(new RegisterReducerEvent(id, { other: false }));

    return () => {
      engine.dispatchEvent(new RemoveReducerEvent(id));
    };
  }, [id]);

  useEffect(() => {
    engine.dispatchEvent(new RegisterReducerEvent(id2, { other: true }));

    return () => {
      engine.dispatchEvent(new RemoveReducerEvent(id2));
    };
  }, [id2]);

  return 'Demo';
}
