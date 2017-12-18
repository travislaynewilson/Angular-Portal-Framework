import { HammerManager } from './hammer-manager';
import { Recognizer } from './recognizer';



export interface HammerStatic {
	new(element: HTMLElement | SVGElement, options?: any): HammerManager;

	Pan: Recognizer;
	Swipe: Recognizer;
	Press: Recognizer;
}
