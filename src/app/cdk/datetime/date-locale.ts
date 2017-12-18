import { InjectionToken, LOCALE_ID } from '@angular/core';



/** InjectionToken for datepicker that can be used to override default locale code. */
export const DATE_LOCALE = new InjectionToken<string>('DATE_LOCALE');



/** Provider for DATE_LOCALE injection token. */
export const DATE_LOCALE_PROVIDER = { provide: DATE_LOCALE, useExisting: LOCALE_ID };