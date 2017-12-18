import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnDestroy,
	SimpleChanges,
	ViewEncapsulation,
} from '@angular/core';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { Subscription } from 'rxjs/Subscription';
import { CoercionHelper } from '@app/cdk';
import { DatepickerComponent } from '../datepicker/datepicker.component';
import { DatepickerIntlService } from '../datepicker-intl.service';



@Component({
	selector: 'app-datepicker-toggle',
	templateUrl: './datepicker-toggle.component.html',
	host: {
		'class': 'app-datepicker-toggle',
	},
	exportAs: 'appDatepickerToggle',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerToggleComponent<D> implements AfterContentInit, OnChanges, OnDestroy {
	private _stateChanges = Subscription.EMPTY;

	/** Datepicker instance that the button will toggle. */
	@Input('for') datepicker: DatepickerComponent<D>;

	/** Whether the toggle button is disabled. */
	@Input()
	get disabled(): boolean {
		return this._disabled === undefined ? this.datepicker.disabled : !!this._disabled;
	}
	set disabled(value: boolean) {
		this._disabled = CoercionHelper.coerceBoolean(value);
	}
	private _disabled: boolean;

	constructor (public _intl: DatepickerIntlService, private _changeDetectorRef: ChangeDetectorRef) { }

	ngOnChanges(changes: SimpleChanges) {
		if (changes.datepicker) {
			this._watchStateChanges();
		}
	}

	ngOnDestroy() {
		this._stateChanges.unsubscribe();
	}

	ngAfterContentInit() {
		this._watchStateChanges();
	}

	_open(event: Event): void {
		if (this.datepicker && !this.disabled) {
			this.datepicker.open();
			event.stopPropagation();
		}
	}

	private _watchStateChanges() {
		const datepickerDisabled = this.datepicker ? this.datepicker._disabledChange : observableOf();
		const inputDisabled = this.datepicker && this.datepicker._datepickerInput ?
			this.datepicker._datepickerInput._disabledChange : observableOf();

		this._stateChanges.unsubscribe();
		this._stateChanges = merge(this._intl.changes, datepickerDisabled, inputDisabled)
			.subscribe(() => this._changeDetectorRef.markForCheck());
	}
}
