import { attachMessageEventTarget } from '../lib/main';
import { createDemoStateReducer, DemoStateEngine } from './DemoStateEngine';

const engine = new DemoStateEngine(createDemoStateReducer);
attachMessageEventTarget(engine, self);
