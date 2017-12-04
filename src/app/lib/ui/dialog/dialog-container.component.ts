import {
	Component,
	ComponentRef,
	ElementRef,
	EmbeddedViewRef,
	EventEmitter,
	Inject,
	Optional,
	ChangeDetectorRef,
	ViewChild,
	ViewEncapsulation,
	ChangeDetectionStrategy,
} from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/platform-browser';
import { BasePortalOutlet, ComponentPortal, PortalOutletDirective, TemplatePortal } from '@app/core/portal';
import { FocusTrap, FocusTrapFactory } from '@app/core/a11y';
import { DialogConfig } from './dialog-config';


/**
 * Throws an exception for the case when a ComponentPortal is
 * attached to a DomPortalOutlet without an origin.
 */
export function throwMatDialogContentAlreadyAttachedError () {
	throw Error('Attempting to attach dialog content after content is already attached');
}

/** Internal component that wraps user-provided dialog content. */
@Component({
	selector: 'app-dialog-container',
	template: `<ng-template appPortalOutlet></ng-template>`,
	styleUrls: ['dialog-container.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	// Using OnPush for dialogs caused some G3 sync issues. Disabled until we can track them down.
	// tslint:disable-next-line:validate-decorators
	changeDetection: ChangeDetectionStrategy.Default,
	animations: [
		trigger('slideDialog', [
			// Note: The `enter` animation doesn't transition to something like `translate3d(0, 0, 0)
			// scale(1)`, because for some reason specifying the transform explicitly, causes IE both
			// to blur the dialog content and decimate the animation performance. Leaving it as `none`
			// solves both issues.
			state('enter', style({ transform: 'none', opacity: 1 })),
			state('void', style({ transform: 'translate3d(0, 25%, 0) scale(0.9)', opacity: 0 })),
			state('exit', style({ transform: 'translate3d(0, 25%, 0)', opacity: 0 })),
			transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
		])
	],
	host: {
		'class': 'app-dialog-container',
		'tabindex': '-1',
		'[attr.role]': '_config?.role',
		'[attr.aria-labelledby]': '_ariaLabelledBy',
		'[attr.aria-describedby]': '_config?.ariaDescribedBy || null',
		'[@slideDialog]': '_state',
		'(@slideDialog.start)': '_onAnimationStart($event)',
		'(@slideDialog.done)': '_onAnimationDone($event)',
	},
})
export class DialogContainerComponent extends BasePortalOutlet {

	/** The portal outlet inside of this container into which the dialog content will be loaded. */
	@ViewChild(PortalOutletDirective) _portalOutlet: PortalOutletDirective;

	/** The class that traps and manages focus within the dialog. */
	private _focusTrap: FocusTrap;

	/** Element that was focused before the dialog was opened. Save this to restore upon close. */
	private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

	/** The dialog configuration. */
	_config: DialogConfig;

	/** State of the dialog animation. */
	_state: 'void' | 'enter' | 'exit' = 'enter';

	/** Emits when an animation state changes. */
	_animationStateChanged = new EventEmitter<AnimationEvent>();

	/** ID of the element that should be considered as the dialog's label. */
	_ariaLabelledBy: string | null = null;

	constructor (
		private _elementRef: ElementRef,
		private _focusTrapFactory: FocusTrapFactory,
		private _changeDetectorRef: ChangeDetectorRef,
		@Optional() @Inject(DOCUMENT) private _document: any) {
		super();
	}

	/**
	 * Attach a ComponentPortal as content to this dialog container.
	 * @param portal Portal to be attached as the dialog content.
	 */
	attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
		if (this._portalOutlet.hasAttached()) {
			throwMatDialogContentAlreadyAttachedError();
		}

		this._savePreviouslyFocusedElement();
		return this._portalOutlet.attachComponentPortal(portal);
	}

	/**
	 * Attach a TemplatePortal as content to this dialog container.
	 * @param portal Portal to be attached as the dialog content.
	 */
	attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
		if (this._portalOutlet.hasAttached()) {
			throwMatDialogContentAlreadyAttachedError();
		}

		this._savePreviouslyFocusedElement();
		return this._portalOutlet.attachTemplatePortal(portal);
	}

	/** Moves the focus inside the focus trap. */
	private _trapFocus () {
		if (!this._focusTrap) {
			this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
		}

		// If were to attempt to focus immediately, then the content of the dialog would not yet be
		// ready in instances where change detection has to run first. To deal with this, we simply
		// wait for the microtask queue to be empty.
		this._focusTrap.focusInitialElementWhenReady();
	}

	/** Restores focus to the element that was focused before the dialog opened. */
	private _restoreFocus () {
		const toFocus = this._elementFocusedBeforeDialogWasOpened;

		// We need the extra check, because IE can set the `activeElement` to null in some cases.
		if (toFocus && typeof toFocus.focus === 'function') {
			toFocus.focus();
		}

		if (this._focusTrap) {
			this._focusTrap.destroy();
		}
	}

	/** Saves a reference to the element that was focused before the dialog was opened. */
	private _savePreviouslyFocusedElement () {
		if (this._document) {
			this._elementFocusedBeforeDialogWasOpened = this._document.activeElement as HTMLElement;

			// Move focus onto the dialog immediately in order to prevent the user from accidentally
			// opening multiple dialogs at the same time. Needs to be async, because the element
			// may not be focusable immediately.
			Promise.resolve().then(() => this._elementRef.nativeElement.focus());
		}
	}

	/** Callback, invoked whenever an animation on the host completes. */
	_onAnimationDone (event: AnimationEvent) {
		if (event.toState === 'enter') {
			this._trapFocus();
		} else if (event.toState === 'exit') {
			this._restoreFocus();
		}

		this._animationStateChanged.emit(event);
	}

	/** Callback, invoked when an animation on the host starts. */
	_onAnimationStart (event: AnimationEvent) {
		this._animationStateChanged.emit(event);
	}

	/** Starts the dialog exit animation. */
	_startExitAnimation (): void {
		this._state = 'exit';

		// Mark the container for check so it can react if the
		// view container is using OnPush change detection.
		this._changeDetectorRef.markForCheck();
	}
}
