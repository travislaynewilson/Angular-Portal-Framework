import { Recognizer } from './recognizer';



export interface HammerManager {
	add(recogniser: Recognizer | Recognizer[]): Recognizer;
	set(options: any): HammerManager;
	emit(event: string, data: any): void;
	off(events: string, handler?: Function): void;
	on(events: string, handler: Function): void;
}
