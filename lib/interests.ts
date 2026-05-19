export function stateCleanupInterest(reducerID: string) {
  return `state://state/${encodeURIComponent(reducerID)}/cleanup`;
}

export function stateChangeInterest(reducerID: string) {
  return `state://state/${encodeURIComponent(reducerID)}/change`;
}
