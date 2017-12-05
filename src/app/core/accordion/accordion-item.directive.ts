import {
	Output,
	Directive,
	EventEmitter,
	Input,
	OnDestroy,
	Optional,
	ChangeDetectorRef,
} from '@angular/core';
import { UniqueSelectionDispatcherService } from '@app/core/collections';
import { AccordionDirective } from './accordion.directive';
import { CoercionHelper } from '@app/core/util';



/** Used to generate unique ID for each accordion item. */
let nextId = 0;

/**
 * An basic directive expected to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by an AccordionDirective parent.
 */
@Directive({
	selector: 'app-accordion-item',
	exportAs: 'appAccordionItem',
})
export class AccordionItemDirective implements OnDestroy {

	/** Event emitted every time the AccordionItemDirective is closed. */
	@Output() closed = new EventEmitter<void>();

	/** Event emitted every time the AccordionItemDirective is opened. */
	@Output() opened = new EventEmitter<void>();

	/** Event emitted when the AccordionItemDirective is destroyed. */
	@Output() destroyed = new EventEmitter<void>();

	/** The unique AccordionItemDirective id. */
	readonly id = `app-accordion-child-${nextId++}`;

	/** Whether the AccordionItemDirective is expanded. */
	@Input()
	get expanded (): any { return this._expanded; }
	set expanded (expanded: any) {
		expanded = CoercionHelper.coerceBoolean(expanded);

		// Only emit events and update the internal value if the value changes.
		if (this._expanded !== expanded) {
			this._expanded = expanded;
			if (expanded) {
				this.opened.emit();
				/**
				 * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
				 * the name value is the id of the accordion.
				 */
				const accordionId = this.accordion ? this.accordion.id : this.id;
				this._expansionDispatcherService.notify(this.id, accordionId);
			} else {
				this.closed.emit();
			}

			// Ensures that the animation will run when the value is set outside of an `@Input`.
			// This includes cases like the open, close and toggle methods.
			this._changeDetectorRef.markForCheck();
		}
	}
	private _expanded: boolean;

	/** Unregister function for _expansionDispatcherService. */
	private _removeUniqueSelectionListener: () => void = () => { };

	constructor ( @Optional() public accordion: AccordionDirective,
		private _changeDetectorRef: ChangeDetectorRef,
		protected _expansionDispatcherService: UniqueSelectionDispatcherService) {
		this._removeUniqueSelectionListener =
			_expansionDispatcherService.listen((id: string, accordionId: string) => {
				if (this.accordion && !this.accordion.multi &&
					this.accordion.id === accordionId && this.id !== id) {
					this.expanded = false;
				}
			});
	}

	/** Emits an event for the accordion item being destroyed. */
	ngOnDestroy () {
		this.destroyed.emit();
		this._removeUniqueSelectionListener();
	}

	/** Toggles the expanded state of the accordion item. */
	toggle (): void {
		this.expanded = !this.expanded;
	}

	/** Sets the expanded state of the accordion item to false. */
	close (): void {
		this.expanded = false;
	}

	/** Sets the expanded state of the accordion item to true. */
	open (): void {
		this.expanded = true;
	}
}
