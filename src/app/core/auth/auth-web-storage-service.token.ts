import { InjectionToken } from "@angular/core";
import { WebStorageService } from "@app/core/storage";



export const AUTH_WEB_STORAGE_SERVICE = new InjectionToken<WebStorageService>('auth-web-storage-service');