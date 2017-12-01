export interface HammerInput {
	preventDefault: () => {};
	deltaX: number;
	deltaY: number;
	center: { x: number; y: number; };
  }