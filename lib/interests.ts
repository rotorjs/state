export function stateInterest(reducerID: string) {
  return `state://state/${encodeURIComponent(reducerID)}`;
}
