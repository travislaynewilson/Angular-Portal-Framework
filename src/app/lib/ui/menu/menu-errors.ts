/** Throws an exception for the case when menu trigger doesn't have a valid mat-menu instance */
export function throwMatMenuMissingError() {
  throw Error(`mat-menu-trigger: must pass in an mat-menu instance.
	  Example:
		<app-menu #menu="appMenu"></app-menu>
		<button [appMenuTriggerFor]="menu"></button>`);
}

/** Throws an exception for the case when menu's x-position value isn't valid. */
export function throwMatMenuInvalidPositionX() {
  throw Error(`x-position value must be either 'before' or after'.
		Example: <app-menu x-position="before" #menu="appMenu"></app-menu>`);
}

/** Throws an exception for the case when menu's y-position value isn't valid. */
export function throwMatMenuInvalidPositionY() {
  throw Error(`y-position value must be either 'above' or below'.
		Example: <app-menu y-position="above" #menu="appMenu"></app-menu>`);
}
