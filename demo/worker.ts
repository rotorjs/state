import { attachWorker } from '../lib/main';
import { ExtendedDemoStateEngine } from './DemoStateEngine';

const controller = new AbortController();
const signal = controller.signal;

const engine = new ExtendedDemoStateEngine();
attachWorker(engine, self, { signal });

engine.addEventListener('register-reducer', (event) => {
  console.log('worker: register reducer', event.id, event.emitter);
});

engine.addEventListener('remove-reducer', (event) => {
  console.log('worker: remove reducer', event.id, event.emitter);
});

engine.addEventListener('action', (event) => {
  console.log('worker: action', event.action, event.emitter);

  if (event.action === 'stop') {
    engine.stop();
    controller.abort();
  }
});

engine.addEventListener('interest', (event) => {
  console.log('worker: interest', event.interest, event.emitter);
});

engine.addEventListener('state', (event) => {
  console.log('worker: state', event.id, event.state, event.emitter);
});
