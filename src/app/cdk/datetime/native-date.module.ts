import { NgModule } from '@angular/core';
import { DATE_FORMAT } from './date-format.type';
import { DateAdapter } from './date-adapter';
import { DATE_LOCALE, DATE_LOCALE_PROVIDER } from './date-locale';
import { NativeDateAdapter } from './native-date-adapter';
import { NATIVE_DATE_FORMAT } from './native-date-format';



@NgModule({
	providers: [
		DATE_LOCALE_PROVIDER,
		{ provide: DateAdapter, useClass: NativeDateAdapter, deps: [DATE_LOCALE] }
	],
})
export class NativeDateLocaleModule { }



@NgModule({
	imports: [
		NativeDateLocaleModule
	],
	providers: [{ provide: DATE_FORMAT, useValue: NATIVE_DATE_FORMAT }]
})
export class NativeDateModule { }