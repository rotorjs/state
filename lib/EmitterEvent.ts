export class EmitterEvent extends Event {
  emitter?: string;

  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
  }
}
