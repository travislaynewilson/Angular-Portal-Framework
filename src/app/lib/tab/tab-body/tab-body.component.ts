import {
	Component,
	Input,
	Inject,
	Output,
	EventEmitter,
	OnDestroy,
	OnInit,
	ElementRef,
	Directive,
	Optional,
	ViewEncapsulation,
	ChangeDetectionStrategy,
	ComponentFactoryResolver,
	ViewContainerRef,
	forwardRef,
} from '@angular/core';
import {
	trigger,
	state,
	style,
	animate,
	transition,
	AnimationEvent,
} from '@angular/animations';
import { TemplatePortal } from '@app/cdk';



/**
 * These position states are used internally as animation states for the tab body. Setting the
 * position state to left, right, or center will transition the tab body from its current
 * position to its respective state. If there is not current position (void, in the case of a new
 * tab body), then there will be no transition animation to its state.
 *
 * In the case of a new tab body that should immediately be centered with an animating transition,
 * then left-origin-center or right-origin-center can be used, which will use left or right as its
 * psuedo-prior state.
 */
export type TabBodyPositionState =
	'left' | 'center' | 'right' | 'left-origin-center' | 'right-origin-center';



/**
 * The origin state is an internally used state that is set on a new tab body indicating if it
 * began to the left or right of the prior selected index. For example, if the selected index was
 * set to 1, and a new tab is created and selected at index 2, then the tab body would have an
 * origin of right because its index was greater than the prior selected index.
 */
export type TabBodyOriginState = 'left' | 'right';



/** Wrapper for the contents of a tab. */
@Component({
	selector: 'app-tab-body',
	templateUrl: 'tab-body.component.html',
	styleUrls: ['tab-body.component.scss'],
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'app-tab-body'
	},
	animations: [
		trigger('translateTab', [
			// Note: transitions to `none` instead of 0, because some browsers might blur the content.
			state('center, void, left-origin-center, right-origin-center', style({ transform: 'none' })),
			state('left', style({ transform: 'translate3d(-100%, 0, 0)' })),
			state('right', style({ transform: 'translate3d(100%, 0, 0)' })),
			transition('* => left, * => right, left => center, right => center',
				animate('250ms cubic-bezier(0.35, 0, 0.25, 1)')),
			transition('void => left-origin-center', [
				style({ transform: 'translate3d(-100%, 0, 0)' }),
				animate('250ms cubic-bezier(0.35, 0, 0.25, 1)')
			]),
			transition('void => right-origin-center', [
				style({ transform: 'translate3d(100%, 0, 0)' }),
				animate('250ms cubic-bezier(0.35, 0, 0.25, 1)')
			])
		])
	]
})
export class TabBodyComponent implements OnInit {

	/** Event emitted when the tab begins to animate towards the center as the active tab. */
	@Output() _onCentering: EventEmitter<number> = new EventEmitter<number>();

	/** Event emitted before the centering of the tab begins. */
	@Output() _beforeCentering: EventEmitter<number> = new EventEmitter<number>();

	/** Event emitted when the tab completes its animation towards the center. */
	@Output() _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

	/** The tab body content to display. */
	@Input('content') _content: TemplatePortal<any>;

	/** The shifted index position of the tab body, where zero represents the active center tab. */
	_position: TabBodyPositionState;
	@Input('position') set position(position: number) {
		if (position < 0) {
			this._position = 'left';
		} else if (position > 0) {
			this._position = 'right';
		} else {
			this._position = 'center';
		}
	}

	/** The origin position from which this tab should appear when it is centered into view. */
	_origin: TabBodyOriginState;

	/** The origin position from which this tab should appear when it is centered into view. */
	@Input('origin') set origin(origin: number) {
		if (origin == null) { return; }

		if (origin <= 0) {
			this._origin = 'left';
		} else {
			this._origin = 'right';
		}
	}

	constructor (private _elementRef: ElementRef) { }

	/**
	 * After initialized, check if the content is centered and has an origin. If so, set the
	 * special position states that transition the tab from the left or right before centering.
	 */
	ngOnInit() {
		if (this._position == 'center' && this._origin) {
			this._position = this._origin == 'left' ? 'left-origin-center' : 'right-origin-center';
		}
	}

	_onTranslateTabStarted(e: AnimationEvent): void {
		if (this._isCenterPosition(e.toState)) {
			this._beforeCentering.emit();
			this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
		}
	}

	_onTranslateTabComplete(e: AnimationEvent): void {
		// If the transition to the center is complete, emit an event.
		if (this._isCenterPosition(e.toState) && this._isCenterPosition(this._position)) {
			this._onCentered.emit();
		}
	}

	/** Whether the provided position state is considered center, regardless of origin. */
	_isCenterPosition(position: TabBodyPositionState | string): boolean {
		return position == 'center' ||
			position == 'left-origin-center' ||
			position == 'right-origin-center';
	}
}
