import { DatepickerInputDirective } from './datepicker-input.directive';



/**
 * An event used for datepicker input and change events. We don't always have access to a native
 * input or change event because the event may have been triggered by the user clicking on the
 * calendar popup. For consistency, we always use DatepickerInputEvent instead.
 */
export class DatepickerInputEvent<D> {
	/** The new value for the target datepicker input. */
	value: D | null;

	constructor (public target: DatepickerInputDirective<D>, public targetElement: HTMLElement) {
		this.value = this.target.value;
	}
}