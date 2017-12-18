import { InjectionToken } from '@angular/core';



/**
 * This token is used to inject the object whose value should be set into `InputDirective`. If none is
 * provided, the native `HTMLInputElement` is used. Directives like `DatepickerInput` can provide
 * themselves for this token, in order to make `InputDirective` delegate the getting and setting of the
 * value to them.
 */
export const INPUT_VALUE_ACCESSOR = new InjectionToken<{ value: any }>('INPUT_VALUE_ACCESSOR');