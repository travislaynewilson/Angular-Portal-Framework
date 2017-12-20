import { Inject, Optional } from "@angular/core";
import { WEB_STORAGE_KEY_PREFIX } from "./web-storage-key-prefix.token";



/** A base service for all web storage services */
export abstract class WebStorageService {

	/** The web storage object used in this service */
	protected store: Storage;

	/** The prefix prepended to all storage keys */
	protected prefix: string;

	constructor (
		private storage: Storage, 
		private _prefix: string
	) {
		this.store = storage;
		this.prefix = _prefix;
	}

	/** Generates a storage key with a global prefix */
	protected generateStorageKey(key: string): string {
		return `${this.prefix}_${key}`;
	}

	/** Gets the value of the provided key from storage */
	get(key: string): any {
		let storageKey = this.generateStorageKey(key);

		let value = this.storage.getItem(storageKey);

		return this.tryParse(value);
	}

	/** Sets the value of the provided key in storage */
	set(key: string, value: any): void {
		let storageKey = this.generateStorageKey(key);

		this.storage.setItem(storageKey, this.tryStringify(value));
	}

	/** Deletes the provided key from storage */
	remove(key: string): void {
		let storageKey = this.generateStorageKey(key);

		this.storage.removeItem(storageKey);
	}

	/** Clears the storage */
	clear(): void {
		this.storage.clear();
	}

	/** Checks if the provided key can be found in storage */
	exists(key: string): boolean {
		let value = this.get(key);

		return value === null;
	}

	/** Returns the value as an parsed object, or the original value if parsing was unsuccessful */
	private tryParse(value: string): any {
		try {
			return JSON.parse(value);
		} catch (e) {
			return value;
		}
	}

	/** Returns the stringified value */
	private tryStringify(value: any): string {
		return typeof value === "string" ? value : JSON.stringify(value);
	}
}