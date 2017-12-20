import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ContentChildren,
	forwardRef,
	Inject,
	Input,
	ViewEncapsulation
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {
	DrawerComponent,
	DrawerContainerComponent,
	DrawerContentComponent
} from './drawer.component';
import { CoercionHelper } from '@app/cdk';



@Component({
	selector: 'app-sidenav-content',
	exportAs: 'appSidenavContent',
	template: '<ng-content></ng-content>',
	host: {
		'class': 'app-drawer-content app-sidenav-content',
		'[style.marginLeft.px]': '_margins.left',
		'[style.marginRight.px]': '_margins.right'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class SidenavContentComponent extends DrawerContentComponent {
	constructor (
		changeDetectorRef: ChangeDetectorRef,
		@Inject(forwardRef(() => SidenavContainerComponent)) container: SidenavContainerComponent) {
		super(changeDetectorRef, container);
	}
}



@Component({
	selector: 'app-sidenav',
	exportAs: 'appSidenav',
	template: '<ng-content></ng-content>',
	animations: [
		trigger('transform', [
			state('open, open-instant', style({
				transform: 'translate3d(0, 0, 0)',
				visibility: 'visible',
			})),
			state('void', style({
				visibility: 'hidden',
			})),
			transition('void => open-instant', animate('0ms')),
			transition('void <=> open, open-instant => void',
				animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
		])
	],
	host: {
		'class': 'app-drawer app-sidenav',
		'tabIndex': '-1',
		'[@transform]': '_animationState',
		'(@transform.start)': '_onAnimationStart($event)',
		'(@transform.done)': '_onAnimationEnd($event)',
		'(keydown)': 'handleKeydown($event)',
		// must prevent the browser from aligning text based on value
		'[attr.align]': 'null',
		'[class.app-drawer-end]': 'position === "end"',
		'[class.app-drawer-over]': 'mode === "over"',
		'[class.app-drawer-push]': 'mode === "push"',
		'[class.app-drawer-side]': 'mode === "side"',
		'[class.app-sidenav-fixed]': 'fixedInViewport',
		'[style.top.px]': 'fixedInViewport ? fixedTopGap : null',
		'[style.bottom.px]': 'fixedInViewport ? fixedBottomGap : null'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class SidenavComponent extends DrawerComponent {

	/** Whether the sidenav is fixed in the viewport. */
	@Input()
	get fixedInViewport(): boolean { return this._fixedInViewport; }
	set fixedInViewport(value) { this._fixedInViewport = CoercionHelper.coerceBoolean(value); }
	private _fixedInViewport = false;

	/**
	 * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
	 * mode.
	 */
	@Input()
	get fixedTopGap(): number { return this._fixedTopGap; }
	set fixedTopGap(value) { this._fixedTopGap = CoercionHelper.coerceNumber(value); }
	private _fixedTopGap = 0;

	/**
	 * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
	 * fixed mode.
	 */
	@Input()
	get fixedBottomGap(): number { return this._fixedBottomGap; }
	set fixedBottomGap(value) { this._fixedBottomGap = CoercionHelper.coerceNumber(value); }
	private _fixedBottomGap = 0;
}



@Component({
	selector: 'app-sidenav-container',
	exportAs: 'appSidenavContainer',
	templateUrl: 'sidenav-container.component.html',
	styleUrls: ['drawer.component.scss'],
	host: {
		'class': 'app-drawer-container app-sidenav-container'
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class SidenavContainerComponent  extends DrawerContainerComponent {
	@ContentChildren(SidenavComponent) _drawers;

	@ContentChild(SidenavContentComponent) _content;
}
