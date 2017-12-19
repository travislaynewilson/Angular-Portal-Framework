import {
	AfterContentChecked,
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	Inject,
	Input,
	Optional,
	QueryList, Renderer2,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { first } from 'rxjs/operators/first';
import { startWith } from 'rxjs/operators/startWith';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { CoercionHelper } from '@app/cdk';
import { ErrorDirective } from '../error.directive';
import { BaseFormFieldControl } from '../base-form-field-control';
import { FormFieldErrors } from '../form-field-errors';
import { HintDirective } from '../hint.directive';
import { PlaceholderDirective } from '../placeholder.directive';
import { PrefixDirective } from '../prefix.directive';
import { SuffixDirective } from '../suffix.directive';



let nextUniqueId = 0;



export type FloatPlaceholderType = 'auto' | 'always' | 'never';



/** Container for form controls that applies common styling and behavior. */
@Component({
	selector: 'app-form-field',
	exportAs: 'appFormField',
	templateUrl: './form-field.component.html',
	// AppInput is a directive and can't have styles, so we need to include its styles here.
	// The AppInput styles are fairly minimal so it shouldn't be a big deal for people who
	// aren't using AppInput.
	styleUrls: ['./form-field.component.scss'],
	animations: [
		trigger('transitionMessages', [
			state('enter', style({ opacity: 1, transform: 'translateY(0%)' })),
			transition('void => enter', [
				style({ opacity: 0, transform: 'translateY(-100%)' }),
				animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
			])
		])
	],
	host: {
		'class': 'app-input-container app-form-field',
		'[class.app-input-invalid]': '_control.errorState',
		'[class.app-form-field-invalid]': '_control.errorState',
		'[class.app-form-field-can-float]': '_canPlaceholderFloat',
		'[class.app-form-field-should-float]': '_control.shouldPlaceholderFloat || _shouldAlwaysFloat',
		'[class.app-form-field-disabled]': '_control.disabled',
		'[class.app-focused]': '_control.focused',
		'[class.app-primary]': 'color == "primary"',
		'[class.app-warn]': 'color == "warn"',
		'[class.ng-untouched]': '_shouldForward("untouched")',
		'[class.ng-touched]': '_shouldForward("touched")',
		'[class.ng-pristine]': '_shouldForward("pristine")',
		'[class.ng-dirty]': '_shouldForward("dirty")',
		'[class.ng-valid]': '_shouldForward("valid")',
		'[class.ng-invalid]': '_shouldForward("invalid")',
		'[class.ng-pending]': '_shouldForward("pending")'
	},
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent implements AfterViewInit, AfterContentInit, AfterContentChecked {

	/** Color of the form field, based on the theme. */
	@Input() color: 'primary' | 'accent' | 'warn' = 'primary';

	/** Whether the required marker should be hidden. */
	@Input()
	get hideRequiredMarker() { return this._hideRequiredMarker; }
	set hideRequiredMarker(value: any) {
		this._hideRequiredMarker = CoercionHelper.coerceBoolean(value);
	}
	private _hideRequiredMarker: boolean;

	/** Override for the logic that disables the placeholder animation in certain cases. */
	private _showAlwaysAnimate = false;

	/** Whether the floating label should always float or not. */
	get _shouldAlwaysFloat() {
		return this._floatPlaceholder === 'always' && !this._showAlwaysAnimate;
	}

	/** Whether the placeholder can float or not. */
	get _canPlaceholderFloat() { return this._floatPlaceholder !== 'never'; }

	/** State of the mat-hint and mat-error animations. */
	_subscriptAnimationState: string = '';

	/** Text for the form field hint. */
	@Input()
	get hintLabel() { return this._hintLabel; }
	set hintLabel(value: string) {
		this._hintLabel = value;
		this._processHints();
	}
	private _hintLabel = '';

	// Unique id for the hint label.
	_hintLabelId: string = `app-hint-${nextUniqueId++}`;

	/** Whether the placeholder should always float, never float or float as the user types. */
	@Input()
	get floatPlaceholder() { return this._floatPlaceholder; }
	set floatPlaceholder(value: FloatPlaceholderType) {
		if (value !== this._floatPlaceholder) {
			this._floatPlaceholder = value || 'auto';
			this._changeDetectorRef.markForCheck();
		}
	}
	private _floatPlaceholder: FloatPlaceholderType;

	/** Reference to the form field's underline element. */
	@ViewChild('underline') underlineRef: ElementRef;
	@ViewChild('connectionContainer') _connectionContainerRef: ElementRef;
	@ViewChild('placeholder') private _placeholder: ElementRef;
	@ContentChild(BaseFormFieldControl) _control: BaseFormFieldControl<any>;
	@ContentChild(PlaceholderDirective) _placeholderChild: PlaceholderDirective;
	@ContentChildren(ErrorDirective) _errorChildren: QueryList<ErrorDirective>;
	@ContentChildren(HintDirective) _hintChildren: QueryList<HintDirective>;
	@ContentChildren(PrefixDirective) _prefixChildren: QueryList<PrefixDirective>;
	@ContentChildren(SuffixDirective) _suffixChildren: QueryList<SuffixDirective>;

	constructor (
		public _elementRef: ElementRef,
		private _renderer: Renderer2,
		private _changeDetectorRef: ChangeDetectorRef) {
		this.floatPlaceholder = 'auto';
	}

	ngAfterContentInit() {
		this._validateControlChild();
		
		if (this._control.controlType) {
			this._renderer.addClass(
				this._elementRef.nativeElement, `app-form-field-type-${this._control.controlType}`);
		}

		// Subscribe to changes in the child control state in order to update the form field UI.
		this._control.stateChanges.pipe(startWith(null!)).subscribe(() => {
			this._validatePlaceholders();
			this._syncDescribedByIds();
			this._changeDetectorRef.markForCheck();
		});

		let ngControl = this._control.ngControl;
		if (ngControl && ngControl.valueChanges) {
			ngControl.valueChanges.subscribe(() => {
				this._changeDetectorRef.markForCheck();
			});
		}

		// Re-validate when the number of hints changes.
		this._hintChildren.changes.pipe(startWith(null)).subscribe(() => {
			this._processHints();
			this._changeDetectorRef.markForCheck();
		});

		// Update the aria-described by when the number of errors changes.
		this._errorChildren.changes.pipe(startWith(null)).subscribe(() => {
			this._syncDescribedByIds();
			this._changeDetectorRef.markForCheck();
		});
	}

	ngAfterContentChecked() {
		this._validateControlChild();
	}

	ngAfterViewInit() {
		// Avoid animations on load.
		this._subscriptAnimationState = 'enter';
		this._changeDetectorRef.detectChanges();
	}

	/** Determines whether a class from the NgControl should be forwarded to the host element. */
	_shouldForward(prop: string): boolean {
		let ngControl = this._control ? this._control.ngControl : null;
		return ngControl && (ngControl as any)[prop];
	}

	/** Whether the form field has a placeholder. */
	_hasPlaceholder() {
		return !!(this._control.placeholder || this._placeholderChild);
	}

	/** Determines whether to display hints or errors. */
	_getDisplayedMessages(): 'error' | 'hint' {
		return (this._errorChildren && this._errorChildren.length > 0 &&
			this._control.errorState) ? 'error' : 'hint';
	}

	/** Animates the placeholder up and locks it in position. */
	_animateAndLockPlaceholder(): void {
		if (this._placeholder && this._canPlaceholderFloat) {
			this._showAlwaysAnimate = true;
			this._floatPlaceholder = 'always';

			fromEvent(this._placeholder.nativeElement, 'transitionend').pipe(first()).subscribe(() => {
				this._showAlwaysAnimate = false;
			});

			this._changeDetectorRef.markForCheck();
		}
	}

	/**
	 * Ensure that there is only one placeholder (either `placeholder` attribute on the child control
	 * or child element with the `app-placeholder` directive).
	 */
	private _validatePlaceholders() {
		if (this._control.placeholder && this._placeholderChild) {
			throw FormFieldErrors.getPlaceholderConflictError();
		}
	}

	/** Does any extra processing that is required when handling the hints. */
	private _processHints() {
		this._validateHints();
		this._syncDescribedByIds();
	}

	/**
	 * Ensure that there is a maximum of one of each `<app-hint>` alignment specified, with the
	 * attribute being considered as `align="start"`.
	 */
	private _validateHints() {
		if (this._hintChildren) {
			let startHint: HintDirective;
			let endHint: HintDirective;
			this._hintChildren.forEach((hint: HintDirective) => {
				if (hint.align == 'start') {
					if (startHint || this.hintLabel) {
						throw FormFieldErrors.getDuplicatedHintError('start');
					}
					startHint = hint;
				} else if (hint.align == 'end') {
					if (endHint) {
						throw FormFieldErrors.getDuplicatedHintError('end');
					}
					endHint = hint;
				}
			});
		}
	}

	/**
	 * Sets the list of element IDs that describe the child control. This allows the control to update
	 * its `aria-describedby` attribute accordingly.
	 */
	private _syncDescribedByIds() {
		if (this._control) {
			let ids: string[] = [];

			if (this._getDisplayedMessages() === 'hint') {
				let startHint = this._hintChildren ?
					this._hintChildren.find(hint => hint.align === 'start') : null;
				let endHint = this._hintChildren ?
					this._hintChildren.find(hint => hint.align === 'end') : null;

				if (startHint) {
					ids.push(startHint.id);
				} else if (this._hintLabel) {
					ids.push(this._hintLabelId);
				}

				if (endHint) {
					ids.push(endHint.id);
				}
			} else if (this._errorChildren) {
				ids = this._errorChildren.map(error => error.id);
			}

			this._control.setDescribedByIds(ids);
		}
	}

	/** Throws an error if the form field's control is missing. */
	protected _validateControlChild() {
		if (!this._control) {
			throw FormFieldErrors.getMissingControlError();
		}
	}
}
