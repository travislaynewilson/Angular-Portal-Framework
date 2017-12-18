import { Directive, forwardRef, Provider } from '@angular/core';
import { CheckboxRequiredValidator, NG_VALIDATORS } from '@angular/forms';



export const BaseCheckboxRequiredValidator = CheckboxRequiredValidator;



export const CHECKBOX_REQUIRED_VALIDATOR: Provider = {
	provide: NG_VALIDATORS,
	useExisting: forwardRef(() => CheckboxRequiredValidatorDirective),
	multi: true
};



/**
 * Validator for checkbox's required attribute in template-driven checkbox.
 * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
 * work with `app-checkbox`.
 */
@Directive({
	selector: `app-checkbox[required][formControlName],
				app-checkbox[required][formControl], 
				app-checkbox[required][ngModel]`,
	providers: [CHECKBOX_REQUIRED_VALIDATOR],
	host: { '[attr.required]': 'required ? "" : null' }
})
export class CheckboxRequiredValidatorDirective extends BaseCheckboxRequiredValidator { }
