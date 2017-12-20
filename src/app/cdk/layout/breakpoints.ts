export const Breakpoints = {
	Phone: '(max-width: 599px) and (orientation: portrait), ' +
		'(max-width: 959px) and (orientation: landscape)',
	Tablet: '(min-width: 600px) and (max-width: 839px) and (orientation: portrait), ' +
		'(min-width: 960px) and (max-width: 1279px) and (orientation: landscape)',
	Web: '(min-width: 840px) and (orientation: portrait), ' +
		'(min-width: 1280px) and (orientation: landscape)',

	PhonePortrait: '(max-width: 599px) and (orientation: portrait)',
	TabletPortrait: '(min-width: 600px) and (max-width: 839px) and (orientation: portrait)',
	WebPortrait: '(min-width: 840px) and (orientation: portrait)',

	PhoneLandscape: '(max-width: 959px) and (orientation: landscape)',
	TabletLandscape: '(min-width: 960px) and (max-width: 1279px) and (orientation: landscape)',
	WebLandscape: '(min-width: 1280px) and (orientation: landscape)',

	XS: '(max-width: 575px)',
	SM: '(min-width: 576px) and (max-width: 767px)',
	MD: '(min-width: 768px) and (max-width: 1299px)',
	LG: '(min-width: 1300px) and (max-width: 1419px)',
	XL: '(min-width: 1420px)'
};