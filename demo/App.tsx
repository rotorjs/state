import { wrapMessageEventTarget } from '@/main';
import './App.css';
import Worker from './worker?worker';

const worker = new Worker();
const engine = wrapMessageEventTarget(worker);

export default function App() {
  return 'Demo';
}
