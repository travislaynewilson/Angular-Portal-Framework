import {
    ViewContainerRef,
    ComponentRef,
    Injector
} from '@angular/core';
import { ComponentType } from './component-type';
import { Portal } from './portal';


/**
 * A `ComponentPortal` is a portal that instantiates some Component upon attachment.
 */
export class ComponentPortal<T> extends Portal<ComponentRef<T>> {

	/** The type of the component that will be instantiated for attachment. */
	component: ComponentType<T>;

	/**
	 * [Optional] Where the attached component should live in Angular's *logical* component tree.
	 * This is different from where the component *renders*, which is determined by the PortalOutlet.
	 * The origin is necessary when the host is outside of the Angular application context.
	 */
	viewContainerRef?: ViewContainerRef | null;

	/** [Optional] Injector used for the instantiation of the component. */
	injector?: Injector | null;

	constructor(
		component: ComponentType<T>,
		viewContainerRef?: ViewContainerRef | null,
		injector?: Injector | null) {
		super();
		this.component = component;
		this.viewContainerRef = viewContainerRef;
		this.injector = injector;
	}
}