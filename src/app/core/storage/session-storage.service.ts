import { Injectable, Inject } from '@angular/core';
import { WebStorageService } from './web-storage.service';
import { WEB_STORAGE_KEY_PREFIX } from './web-storage-key-prefix.token';



@Injectable()
export class SessionStorageService extends WebStorageService {
	constructor (
		@Inject(WEB_STORAGE_KEY_PREFIX) private _keyPrefix: string
	) {
		super(sessionStorage, _keyPrefix);
	}
}