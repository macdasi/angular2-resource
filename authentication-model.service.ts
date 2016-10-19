/**
 * Created by hadar.m on 09/08/2016.
 */
import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import '../extentions/rxjs-extensions';

import {ModelBaseService, ModelBaseOptions} from "./model-base.service";
import {Subject, BehaviorSubject, Observable} from "rxjs/Rx";
import {IAuthenticationModel} from "../models/authentication.model";
import {IUserModel} from "../models/user.model";


@Injectable()
export class AuthenticationModelService extends ModelBaseService<IAuthenticationModel> {
    private currentUserSource: BehaviorSubject<IUserModel> = new BehaviorSubject<IUserModel>(null);
    private currentSessionSource: Subject<string> = new Subject<string>();
    public  signInInProgress:boolean = false;

    user$:Observable<IUserModel> = this.currentUserSource.asObservable();
    session$:Observable<string> = this.currentSessionSource.asObservable();


    constructor(http:Http) {
        super(http, new ModelBaseOptions('authentication') );
    }

    recoverSession(sessionId:string){
        if(this.signInInProgress == true){
            return;
        }
        this.signInInProgress = true;
        this.http['setAuthCalls'](sessionId);
        this.find(null, null).subscribe(data => {
            this.signInInProgress = false;
            this.http['setAuthCalls'](data.sessionId);
            this.currentUserSource.next( data.user);

        } , error => {
            this.signInInProgress = false;
            this.http['setAuthCalls'](null);
            this.currentSessionSource.next( null);
        });
    }

    signIn(username:string, password:string) {
        if(this.signInInProgress == true){
            return;
        }
        let options:any = {headers:null};

        options.headers = new Headers({
            'X-Application': 'application id',
            'X-Domain': '.',
            'X-Username': encodeURIComponent(username),
            'X-Password': encodeURIComponent(username)
        });
        this.signInInProgress = true;
        this.create(null, null, options).subscribe(data => {
            this.signInInProgress = false;
            this.http['setAuthCalls'](data.sessionId);
            this.currentSessionSource.next( data.sessionId);
            this.currentUserSource.next( data.user);
        }, error => {
            this.signInInProgress = false;
        });
    }

    signOut(){
        this.delete().subscribe(data => {
                this.http['setAuthCalls'](data);
                this.currentSessionSource.next( null);
                this.currentUserSource.next( null);
            });
    }

}
