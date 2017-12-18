/** Time in ms to delay before changing the tooltip visibility to hidden */
export const TOUCHEND_HIDE_DELAY = 1500;



/** Time in ms to throttle repositioning after scroll events. */
export const SCROLL_THROTTLE_MS = 20;



/** CSS class that will be attached to the overlay panel. */
export const TOOLTIP_PANEL_CLASS = 'app-tooltip-panel';



/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getAppTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}



export type TooltipVisibility = 'initial' | 'visible' | 'hidden';



export type TooltipPosition = 'left' | 'right' | 'above' | 'below';
