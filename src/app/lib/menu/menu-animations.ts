import {
	trigger,
	state,
	style,
	animate,
	transition,
	AnimationTriggerMetadata,
} from '@angular/animations';



/**
 * This animation controls the menu panel's entry and exit from the page.
 *
 * When the menu panel is added to the DOM, it scales in and fades in its border.
 *
 * When the menu panel is removed from the DOM, it simply fades out after a brief
 * delay to display the ripple.
 */
export const transformMenu: AnimationTriggerMetadata = trigger('transformMenu', [
	state('void', style({
		opacity: 0,
		// This starts off from 0.01, instead of 0, because there's an issue in the Angular animations
		// as of 4.2, which causes the animation to be skipped if it starts from 0.
		transform: 'scale(0.01, 0.01)'
	})),
	state('enter-start', style({
		opacity: 1,
		transform: 'scale(1, 0.5)'
	})),
	state('enter', style({
		transform: 'scale(1, 1)'
	})),
	transition('void => enter-start', animate('100ms linear')),
	transition('enter-start => enter', animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
	transition('* => void', animate('100ms 50ms linear', style({ opacity: 0 })))
]);



/**
 * This animation fades in the background color and content of the menu panel
 * after its containing element is scaled in.
 */
export const fadeInItems: AnimationTriggerMetadata = trigger('fadeInItems', [
	state('showing', style({ opacity: 1 })),
	transition('void => *', [
		style({ opacity: 0 }),
		animate('200ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
	])
]);
