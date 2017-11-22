import {Injectable} from '@angular/core';
import {Platform} from '../../core/platform';


// The InteractivityChecker leans heavily on the ally.js accessibility utilities.
// Methods like `isTabbable` are only covering specific edge-cases for the browsers which are
// supported.

/**
 * Utility for checking the interactivity of an element, such as whether is is focusable or
 * tabbable.
 */
@Injectable()
export class InteractivityCheckerUtility {

  constructor(private _platform: Platform) {}

  /**
   * Gets whether an element is disabled.
   *
   * @param element Element to be checked.
   * @returns Whether the element is disabled.
   */
  isDisabled(element: HTMLElement): boolean {
    // This does not capture some cases, such as a non-form control with a disabled attribute or
    // a form control inside of a disabled form, but should capture the most common cases.
    return element.hasAttribute('disabled');
  }

  /**
   * Gets whether an element is visible for the purposes of interactivity.
   *
   * This will capture states like `display: none` and `visibility: hidden`, but not things like
   * being clipped by an `overflow: hidden` parent or being outside the viewport.
   *
   * @returns Whether the element is visible.
   */
  isVisible(element: HTMLElement): boolean {
    return hasGeometry(element) && getComputedStyle(element).visibility === 'visible';
  }

  /**
   * Gets whether an element can be focused by the user.
   *
   * @param element Element to be checked.
   * @returns Whether the element is focusable.
   */
  isFocusable(element: HTMLElement): boolean {
    // Perform checks in order of left to most expensive.
    // Again, naive approach that does not capture many edge cases and browser quirks.
    return isPotentiallyFocusable(element) && !this.isDisabled(element) && this.isVisible(element);
  }

}

/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element: HTMLElement): boolean {
  // Use logic from jQuery to check for an invisible element.
  // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
  return !!(element.offsetWidth || element.offsetHeight ||
      (typeof element.getClientRects === 'function' && element.getClientRects().length));
}

/** Gets whether an element's  */
function isNativeFormElement(element: Node) {
  let nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' ||
      nodeName === 'select' ||
      nodeName === 'button' ||
      nodeName === 'textarea';
}

/** Gets whether an element is an <input type="hidden">. */
function isHiddenInput(element: HTMLElement): boolean {
  return isInputElement(element) && element.type == 'hidden';
}

/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element: HTMLElement): boolean {
  return isAnchorElement(element) && element.hasAttribute('href');
}

/** Gets whether an element is an input element. */
function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.nodeName.toLowerCase() == 'input';
}

/** Gets whether an element is an anchor element. */
function isAnchorElement(element: HTMLElement): element is HTMLAnchorElement {
  return element.nodeName.toLowerCase() == 'a';
}

/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element: HTMLElement): boolean {
  if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
    return false;
  }

  let tabIndex = element.getAttribute('tabindex');

  // IE11 parses tabindex="" as the value "-32768"
  if (tabIndex == '-32768') {
    return false;
  }

  return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}

/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element: HTMLElement): boolean {
  // Inputs are potentially focusable *unless* they're type="hidden".
  if (isHiddenInput(element)) {
    return false;
  }

  return isNativeFormElement(element) ||
      isAnchorWithHref(element) ||
      element.hasAttribute('contenteditable') ||
      hasValidTabIndex(element);
}