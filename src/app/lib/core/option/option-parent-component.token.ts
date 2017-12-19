import { InjectionToken } from '@angular/core';
import { OptionParentComponent } from './option-parent-component';



/** Injection token used to provide the parent component to options. */
export const OPTION_PARENT_COMPONENT = new InjectionToken<OptionParentComponent>('option-parent-component');