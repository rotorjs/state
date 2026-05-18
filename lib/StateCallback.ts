export type StateCallback<State> = {
  bivarianceHack(state: State): void;
}['bivarianceHack'];
