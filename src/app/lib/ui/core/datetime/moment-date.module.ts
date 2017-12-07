import { NgModule } from '@angular/core';
import { DATE_FORMAT } from './date-format.type';
import { DateAdapter } from './date-adapter';
import { DATE_LOCALE, DATE_LOCALE_PROVIDER } from './date-locale';
import { MomentDateAdapter } from './moment-date-adapter';
import { MOMENT_DATE_FORMAT } from './moment-date-format';



@NgModule({
	providers: [
		DATE_LOCALE_PROVIDER,
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [DATE_LOCALE] }
	],
})
export class MomentDateLocaleModule { }



@NgModule({
	imports: [
		MomentDateLocaleModule
	],
	providers: [{ provide: DATE_FORMAT, useValue: MOMENT_DATE_FORMAT }]
})
export class MomentDateModule { }