import {XHRBackend, BrowserXhr, ResponseOptions, XSRFStrategy, Request, Response , XHRConnection} from "@angular/http";
import {Observable, Subject} from "rxjs/Rx";

/**
 * Created by hadar.m on 15/08/2016.
 */

export interface IError{
    err: any;
    source: any;
}

export class AuthConnectionBackend extends XHRBackend {
    private errorSource = new Subject<IError>();
    error$:Observable<IError> = this.errorSource.asObservable();

    constructor(_browserXhr: BrowserXhr,
                _baseResponseOptions: ResponseOptions,
                _xsrfStrategy: XSRFStrategy ) {
        super(_browserXhr, _baseResponseOptions, _xsrfStrategy);
    }




    createConnection(request: Request) {
        let xhrConnection:XHRConnection = super.createConnection(request);
        let _self = this;

        xhrConnection.response = xhrConnection.response.catch((error: Response) => {
            let errObj:IError = {err : error,source : null};
            if(_self && _self.errorSource){
                _self.errorSource.next(errObj);
            }

            return Observable.throw(error);
        });
        return xhrConnection;
    }

}