import {ViewContainerRef} from '@angular/core';
import {DialogPosition} from './dialog-position';
import {DialogRole} from './dialog-role';

/**
 * Configuration for opening a modal dialog with the MatDialog service.
 */
export class DialogConfig<D = any> {

  /**
   * Where the attached component should live in Angular's *logical* component tree.
   * This affects what is available for injection and the change detection order for the
   * component instantiated inside of the dialog. This does not affect where the dialog
   * content will be rendered.
   */
  viewContainerRef?: ViewContainerRef;

  /** ID for the dialog. If omitted, a unique one will be generated. */
  id?: string;

  /** The ARIA role of the dialog element. */
  role?: DialogRole = 'dialog';

  /** Custom class for the overlay pane. */
  panelClass?: string | string[] = '';

  /** Whether the dialog has a backdrop. */
  hasBackdrop?: boolean = true;

  /** Custom class for the backdrop, */
  backdropClass?: string = '';

  /** Whether the user can use escape or clicking outside to close a modal. */
  disableClose?: boolean = false;

  /** Width of the dialog. */
  width?: string = '';

  /** Height of the dialog. */
  height?: string = '';

  /** Min-width of the dialog. If a number is provided, pixel units are assumed. */
  minWidth?: number | string;

  /** Min-height of the dialog. If a number is provided, pixel units are assumed. */
  minHeight?: number | string;

  /** Max-width of the dialog. If a number is provided, pixel units are assumed. Defaults to 80vw */
  maxWidth?: number | string = '80vw';

  /** Max-height of the dialog. If a number is provided, pixel units are assumed. */
  maxHeight?: number | string;

  /** Position overrides. */
  position?: DialogPosition;

  /** Data being injected into the child component. */
  data?: D | null = null;

  /** ID of the element that describes the dialog.  */
  ariaDescribedBy?: string | null = null;
}
