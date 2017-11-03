import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class LoaderService {

    private loaderSubject = new Subject<LoaderState>();
    private requests = 0;

    loaderState = this.loaderSubject.asObservable();

    constructor() { }

    show() {
        ++this.requests;
        this.loaderSubject.next(<LoaderState>{
            show: this.requests > 0,
            requests: this.requests
        });
    }

    hide() {
        --this.requests;
        this.loaderSubject.next(<LoaderState>{
            show: this.requests > 0,
            requests: this.requests
        });
    }
}

export interface LoaderState {
    requests: Number;
    show: boolean;
}