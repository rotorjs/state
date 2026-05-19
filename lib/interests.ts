export function stateInterest(reducerID: string) {
  return `state://reducer/${encodeURIComponent(reducerID)}/state`;
}

export function stateReducerCleanupInterest(reducerID: string) {
  return `state://reducer/${encodeURIComponent(reducerID)}/cleanup`;
}
