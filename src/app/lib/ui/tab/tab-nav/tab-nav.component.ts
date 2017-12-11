import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChildren,
	Directive,
	ElementRef,
	forwardRef,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	Optional,
	QueryList,
	Renderer2,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { of as observableOf } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
import { CoercionHelper } from '@app/core/util';
import { ViewportRuler } from '@app/core/layout';
import { InkBarDirective } from '../ink-bar.directive';



export type ThemePalette = 'primary' | undefined;


/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
	selector: 'app-tab-nav, [appTabNav]',
	exportAs: 'appTabNav',
	templateUrl: './tab-nav.component.html',
	styleUrls: ['./tab-nav.component.scss'],
	host: { 'class': 'app-tab-nav' },
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabNavComponent implements AfterContentInit, OnDestroy {

	private _color: ThemePalette;

	@Input()
	get color (): ThemePalette { return this._color; }
	set color (value: ThemePalette) {
		const colorPalette = value || 'primary';

		if (colorPalette !== this._color) {
			if (this._color) {
				this._renderer.removeClass(this._elementRef.nativeElement, `app-${this._color}`);
			}
			if (colorPalette) {
				this._renderer.addClass(this._elementRef.nativeElement, `app-${colorPalette}`);
			}

			this._color = colorPalette;
		}
	}


	/** Subject that emits when the component has been destroyed. */
	private _onDestroy = new Subject<void>();

	_activeLinkChanged: boolean;
	_activeLinkElement: ElementRef;

	@ViewChild(InkBarDirective) _inkBar: InkBarDirective;

	/** Query list of all tab links of the tab navigation. */
	@ContentChildren(forwardRef(() => TabLinkDirective), { descendants: true })
	_tabLinks: QueryList<TabLinkDirective>;

	/** Background color of the tab nav. */
	@Input()
	get backgroundColor (): ThemePalette { return this._backgroundColor; }
	set backgroundColor (value: ThemePalette) {
		let nativeElement = this._elementRef.nativeElement;

		this._renderer.removeClass(nativeElement, `app-background-${this.backgroundColor}`);

		if (value) {
			this._renderer.addClass(nativeElement, `app-background-${value}`);
		}

		this._backgroundColor = value;
	}
	private _backgroundColor: ThemePalette;

	constructor (private _renderer: Renderer2,
		private _elementRef: ElementRef,
		private _ngZone: NgZone,
		private _changeDetectorRef: ChangeDetectorRef,
		private _viewportRuler: ViewportRuler) {
		this.color = 'primary';
	}

	/** Notifies the component that the active link has been changed. */
	updateActiveLink (element: ElementRef) {
		this._activeLinkChanged = this._activeLinkElement != element;
		this._activeLinkElement = element;

		if (this._activeLinkChanged) {
			this._changeDetectorRef.markForCheck();
		}
	}

	ngAfterContentInit (): void {
		this._ngZone.runOutsideAngular(() => {
			return this._viewportRuler.change(10).pipe(takeUntil(this._onDestroy))
				.subscribe(() => this._alignInkBar());
		});
	}

	/** Checks if the active link has been changed and, if so, will update the ink bar. */
	ngAfterContentChecked (): void {
		if (this._activeLinkChanged) {
			this._alignInkBar();
			this._activeLinkChanged = false;
		}
	}

	ngOnDestroy () {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	/** Aligns the ink bar to the active link. */
	_alignInkBar (): void {
		if (this._activeLinkElement) {
			this._inkBar.alignToElement(this._activeLinkElement.nativeElement);
		}
	}
}



/**
 * Link inside of a `app-tab-nav-bar`.
 */
@Directive({
	selector: '[appTabLink]',
	exportAs: 'appTabLink',
	host: {
		'class': 'app-tab-link',
		'[attr.aria-disabled]': 'disabled.toString()',
		'[attr.tabIndex]': 'tabIndex',
		'[class.app-tab-disabled]': 'disabled',
		'[class.app-tab-label-active]': 'active'
	}
})
export class TabLinkDirective implements AfterContentInit, OnDestroy, OnChanges {

	@ContentChildren(RouterLink, { descendants: true }) links: QueryList<RouterLink>;
	@ContentChildren(RouterLinkWithHref, { descendants: true })
	linksWithHrefs: QueryList<RouterLinkWithHref>;

	private _disabled: boolean = false;

	@Input()
	get disabled () { return this._disabled; }
	set disabled (value: any) { this._disabled = CoercionHelper.coerceBoolean(value); }

	/** Whether the tab link is active or not. */
	private _isActive: boolean = false;

	/** Whether the link is active. */
	@Input()
	get active (): boolean { return this._isActive; }
	set active (value: boolean) {
		this._isActive = value;
		if (value) {
			this._tabNav.updateActiveLink(this._elementRef);
		}
	}

	@Input() routerLinkActiveOptions: { exact: boolean } = { exact: false };

	private subscription: Subscription;

	get tabIndex (): number | null {
		return this.disabled ? null : 0;
	}

	constructor (private _tabNav: TabNavComponent,
		private _elementRef: ElementRef,
		private renderer: Renderer2,
		private router: Router,
		private cdr: ChangeDetectorRef) {

		this.subscription = router.events.subscribe(s => {
			if (s instanceof NavigationEnd) {
				this.update();
			}
		});
	}

	ngAfterContentInit (): void {
		this.links.changes.subscribe(_ => this.update());
		this.linksWithHrefs.changes.subscribe(_ => this.update());
		this.update();
	}

	ngOnChanges (changes: SimpleChanges): void { this.update(); }

	ngOnDestroy (): void { this.subscription.unsubscribe(); }

	update (): void {
		if (!this.links || !this.linksWithHrefs || !this.router.navigated) return;
		Promise.resolve().then(() => {
			const hasActiveLinks = this.hasActiveLinks();
			if (this.active !== hasActiveLinks) {
				this.active = hasActiveLinks;
			}
		});
	}

	private isLinkActive (router: Router): (link: (RouterLink | RouterLinkWithHref)) => boolean {
		return (link: RouterLink | RouterLinkWithHref) =>
			router.isActive(link.urlTree, this.routerLinkActiveOptions.exact);
	}

	private hasActiveLinks (): boolean {
		return this.links.some(this.isLinkActive(this.router)) ||
			this.linksWithHrefs.some(this.isLinkActive(this.router));
	}
}
