/** Cached result of whether the user's browser supports passive event listeners. */
let supportsPassiveEvents: boolean;

/**
 * Checks whether the user's browser supports passive event listeners.
 * See: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
 */
export function supportsPassiveEventListeners(): boolean {
  if (supportsPassiveEvents == null) {
    try {
      window.addEventListener('test', null!, Object.defineProperty({}, 'passive', {
        get: () => supportsPassiveEvents = true
      }));
    } finally {
      supportsPassiveEvents = supportsPassiveEvents || false;
    }
  }

  return supportsPassiveEvents;
}
