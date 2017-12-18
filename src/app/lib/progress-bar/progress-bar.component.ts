import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation } from '@angular/core';



@Component({
	selector: 'app-progress-bar',
	exportAs: 'appProgressBar',
	host: {
		'role': 'progressbar',
		'aria-valuemin': '0',
		'aria-valuemax': '100',
		'[attr.aria-valuenow]': 'value',
		'[attr.mode]': 'mode',
		'[class.app-primary]': 'color == "primary"',
		'[class.app-accent]': 'color == "accent"',
		'[class.app-warn]': 'color == "warn"',
		'class': 'app-progress-bar',
	},
	templateUrl: 'progress-bar.component.html',
	styleUrls: ['progress-bar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	preserveWhitespaces: false
})
export class ProgressBarComponent {

	/** Color of the progress bar. */
	@Input() color: 'primary' | 'accent' | 'warn' = 'primary';

	private _value: number = 0;

	/** Value of the progressbar. Defaults to zero. Mirrored to aria-valuenow. */
	@Input()
	get value() { return this._value; }
	set value(v: number) { this._value = clamp(v || 0); }

	/** Mode of the progress bar. */
	@Input() mode: 'determinate' | 'indeterminate' = 'determinate';

	/** Gets the current transform value for the progress bar's primary indicator. */
	_primaryTransform() {
		let scale = this.value / 100;
		return { transform: `scaleX(${scale})` };
	}

}



/** Clamps a value to be between two numbers, by default 0 and 100. */
function clamp(v: number, min = 0, max = 100) {
	return Math.max(min, Math.min(max, v));
}
