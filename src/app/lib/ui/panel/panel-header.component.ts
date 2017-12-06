import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Host,
	Input,
	OnDestroy,
	ViewEncapsulation,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs/operators/filter';
import { merge } from 'rxjs/observable/merge';
import { Subscription } from 'rxjs/Subscription';
import { FocusMonitorService } from '@app/core/a11y';
import { KeyCodes } from '@app/core/keycodes';
import { PANEL_ANIMATION_TIMING, PanelComponent } from './panel.component';



/**
 * <app-panel-header> component.
 *
 * This component corresponds to the header element of an <app-panel>.
 */
@Component({
	selector: 'app-panel-header',
	styleUrls: ['./panel-header.component.scss'],
	templateUrl: './panel-header.component.html',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'class': 'app-panel-header',
		'role': 'button',
		'[attr.tabindex]': 'panel.disabled ? -1 : 0',
		'[attr.aria-controls]': '_getPanelId()',
		'[attr.aria-expanded]': '_isExpanded()',
		'[attr.aria-disabled]': 'panel.disabled',
		'[class.app-expanded]': '_isExpanded()',
		'(click)': '_toggle()',
		'(keyup)': '_keyup($event)',
		'[@expansionHeight]': `{
        value: _getExpandedState(),
        params: {
          collapsedHeight: collapsedHeight,
          expandedHeight: expandedHeight
        }
    }`
	},
	animations: [
		trigger('indicatorRotate', [
			state('collapsed', style({ transform: 'rotate(0deg)' })),
			state('expanded', style({ transform: 'rotate(180deg)' })),
			transition('expanded <=> collapsed', animate(PANEL_ANIMATION_TIMING))
		]),
		trigger('expansionHeight', [
			state('collapsed', style({
				height: '{{collapsedHeight}}',
			}), {
					params: { collapsedHeight: '48px' }
				}),
			state('expanded', style({
				height: '{{expandedHeight}}'
			}), {
					params: { expandedHeight: '64px' }
				}),
			transition('expanded <=> collapsed', animate(PANEL_ANIMATION_TIMING))
		])
	]
})
export class PanelHeaderComponent implements OnDestroy {
	private _parentChangeSubscription = Subscription.EMPTY;

	constructor (
		@Host() public panel: PanelComponent,
		private _element: ElementRef,
		private _focusMonitorService: FocusMonitorService,
		private _changeDetectorRef: ChangeDetectorRef) {

		// Since the toggle state depends on an @Input on the panel, we
		// need to  subscribe and trigger change detection manually.
		this._parentChangeSubscription = merge(
			panel.opened,
			panel.closed,
			panel._inputChanges.pipe(filter(changes => !!(changes.hideToggle || changes.disabled)))
		)
			.subscribe(() => this._changeDetectorRef.markForCheck());

		_focusMonitorService.monitor(_element.nativeElement, false);
	}

	/** Height of the header while the panel is expanded. */
	@Input() expandedHeight: string;

	/** Height of the header while the panel is collapsed. */
	@Input() collapsedHeight: string;

	/** Toggles the expanded state of the panel. */
	_toggle (): void {
		if (!this.panel.disabled) {
			this.panel.toggle();
		}
	}

	/** Gets whether the panel is expanded. */
	_isExpanded (): boolean {
		return this.panel.expanded;
	}

	/** Gets the expanded state string of the panel. */
	_getExpandedState (): string {
		return this.panel._getExpandedState();
	}

	/** Gets the panel id. */
	_getPanelId (): string {
		return this.panel.id;
	}

	/** Gets whether the expand indicator should be shown. */
	_showToggle (): boolean {
		return !this.panel.hideToggle && !this.panel.disabled;
	}

	/** Handle keyup event calling to toggle() if appropriate. */
	_keyup (event: KeyboardEvent) {
		switch (event.keyCode) {
			// Toggle for space and enter keys.
			case KeyCodes.SPACE:
			case KeyCodes.ENTER:
				event.preventDefault();
				this._toggle();
				break;
			default:
				return;
		}
	}

	ngOnDestroy () {
		this._parentChangeSubscription.unsubscribe();
		this._focusMonitorService.stopMonitoring(this._element.nativeElement);
	}
}