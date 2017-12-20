import { NgModule } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { SessionStorageService } from "./session-storage.service";
import { WEB_STORAGE_KEY_PREFIX } from "./web-storage-key-prefix.token";



@NgModule({
	providers: [
		LocalStorageService,
		SessionStorageService,
		{ provide: WEB_STORAGE_KEY_PREFIX, useValue: 'app' }
	]
})
export class StorageModule { }