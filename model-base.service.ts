/**
 * Created by hadar.m on 08/08/2016.
 */
import {Injectable} from '@angular/core';
import {RequestOptionsArgs, Response, Http} from '@angular/http';
import '../extentions/rxjs-extensions';
import { Observable } from 'rxjs/Observable';
import {Subject} from "rxjs/Rx";
import 'rxjs/add/operator/map';

export class ModelBaseOptions{
    endPoint:string;
    constructor(endPoint:string){
        this.endPoint = endPoint;
    }
}

/*
this base service handles:
 1. convert response to json
 2. picks element root from json
 3. convert to T type
 4. hook handlError

 */
@Injectable()
export class ModelBaseService<T> {
    private errorSource = new Subject<Response>();
    error$:Observable<Response> = this.errorSource.asObservable();

    constructor( public http:Http,
                 public modelBaseOptions:ModelBaseOptions ) {
    }

    find(url?: string, options?: RequestOptionsArgs): Observable<T> {
        return this.interceptGet<T>(this.http.get(url || this.modelBaseOptions.endPoint,options));
    }

    findAll(url?: string, options?: RequestOptionsArgs): Observable<Array<T>> {
        return this.interceptGet<Array<T>>(this.http.get(url || this.modelBaseOptions.endPoint,options));
    }

    create(body: string,url?: string,  options?: RequestOptionsArgs): Observable<T> {
        return this.interceptPost(this.http.post(url || this.modelBaseOptions.endPoint, body, options));
    }

    delete(url?: string, options?: RequestOptionsArgs): Observable<T> {
        return this.interceptDelete(this.http.delete(url || this.modelBaseOptions.endPoint, options));
    }

    interceptGet<S>(observable: Observable<Response>): Observable<S> {
        return observable
            .map(res => res.json())
            .map((data:any) => {
                return this.deserializeResponse<S>(data);
            }).catch((err)=>{return this.handleError(err);});
    }

    interceptPost(observable: Observable<Response>): Observable<T> {
        return observable
            .map(res => res.json())
            .map(data => {
                return this.deserializeResponse<T>(data);
            }).catch((err)=>{return this.handleError(err);});
    }

    interceptDelete(observable: Observable<Response>): Observable<T> {
        return observable
            .map(res => res.json())
            .map(data => {
                return null;// data[this.modelBaseOptions.endPoint];
            }).catch((err)=>{return this.handleError(err);});
    }

    addError(error:Response){
        this.errorSource.next(error);
    }

    private deserializeResponse<T>(json):T{
        if(json && json[this.modelBaseOptions.endPoint]){
            return json[this.modelBaseOptions.endPoint] as T;
        }
        if(json['undisplayedMatches'] !== undefined){
            return null;
        }
        return json as T;
    }

    private handleError (err: Response) {
        /*let errMsg:string = 'Server error';
        if(error.err && error.err['_body']){
            try{
                errMsg = (JSON.parse(error.err['_body']) as IErrorModel).errorDetails.details;
            }catch(x){
                errMsg = error.err['_body'];
            }
        } else if(error.err && error.err['message']){
            errMsg = error.err['message'];
        }*/
        this.errorSource.next(err);
        return Observable.throw(err);
    }
}