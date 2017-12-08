import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import { KeyCodes } from '@app/core/keycodes';
import { CalendarComponent } from '../calendar/calendar.component';
import { DatepickerComponent } from '../datepicker/datepicker.component';


/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * CalendarComponent directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 */
@Component({
	selector: 'app-datepicker-content',
	templateUrl: 'datepicker-content.component.html',
	styleUrls: ['datepicker-content.component.scss'],
	host: {
		'class': 'app-datepicker-content',
		'[class.app-datepicker-content-touch]': 'datepicker.touchUi',
		'(keydown)': '_handleKeydown($event)'
	},
	exportAs: 'appDatepickerContent',
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerContentComponent<D> implements AfterContentInit {
	datepicker: DatepickerComponent<D>;

	@ViewChild(CalendarComponent) _calendar: CalendarComponent<D>;

	ngAfterContentInit () {
		this._calendar._focusActiveCell();
	}

	/**
	 * Handles keydown event on datepicker content.
	 * @param event The event.
	 */
	_handleKeydown (event: KeyboardEvent): void {
		if (event.keyCode === KeyCodes.ESCAPE) {
			this.datepicker.close();
			event.preventDefault();
			event.stopPropagation();
		}
	}
}