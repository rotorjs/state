import { RegisterReducerEvent, RemoveReducerEvent, wrapWorker } from '@/main';
import { useEffect } from 'react';
import './App.css';
import { type DemoStateEventTarget } from './DemoStateEngine';
// eslint-disable-next-line import-x/default
import Worker from './worker?worker';

const worker = new Worker();
const engine: DemoStateEventTarget = wrapWorker(worker);
// const engine = new DemoStateEngine();

engine.addEventListener('register-reducer', (event) => {
  console.log('main: register reducer', event.id, event.emitter);
});

engine.addEventListener('remove-reducer', (event) => {
  console.log('main: remove reducer', event.id, event.emitter);
});

engine.addEventListener('action', (event) => {
  console.log('main: action', event.action, event.emitter);
});

engine.addEventListener('interest', (event) => {
  console.log('main: interest', event.interest, event.emitter);
});

engine.addEventListener('state', (event) => {
  console.log('main: state', event.id, event.state, event.emitter);
});

let nextId = 0;

export default function App() {
  useEffect(() => {
    const id = (nextId++).toFixed();

    engine.dispatchEvent(new RegisterReducerEvent(id, { other: false }));

    return () => {
      engine.dispatchEvent(new RemoveReducerEvent(id));
    };
  }, []);

  useEffect(() => {
    const id = (nextId++).toFixed();

    engine.dispatchEvent(new RegisterReducerEvent(id, { other: true }));

    return () => {
      engine.dispatchEvent(new RemoveReducerEvent(id));
    };
  }, []);

  return 'Demo';
}
