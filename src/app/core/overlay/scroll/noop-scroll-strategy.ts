import {ScrollStrategy} from './scroll-strategy';

/** Scroll strategy that doesn't do anything. */
export class NoopScrollStrategy implements ScrollStrategy {

  /** Does nothing */
  enable() { }

  /** Does nothing */
  disable() { }

  /** Does nothing */
  attach() { }
  
}
