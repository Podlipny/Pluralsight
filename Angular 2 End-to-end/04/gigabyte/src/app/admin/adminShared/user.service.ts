import { Injectable } from '@angular/core';
import {  
    CanActivate, 
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import * as firebase from 'firebase';


@Injectable()
export class UserService implements CanActivate {
    userLoggedIn: boolean = false;
    loggedInUser: string;
    authUser: any;
    
    constructor( private router: Router ) {
        //inicializujeme Firebase
        firebase.initializeApp({
            apiKey: "API Key Goes Here",
    	    authDomain: "Auth Domain Goes Here",
            databaseURL: "Database URL goes here",
            storageBucket: "Storage bucket info goes here",
            messagingSenderId: "Message Sender ID goes here"
        })
     }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean { 
        //overujeme routy zda mame pristup
        let url: string = state.url;
        return this.verifyLogin(url);
    }   

    verifyLogin(url: string): boolean {
        if (this.userLoggedIn) { return true; }
                
        this.router.navigate(['/admin/login']);
        return false;
    }

    register(email: string, password: string){
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .catch(function(error) {
                alert(`${error.message} Please Try Again!`);
        });
    }

    //vola se z jednotlivych component.ts jako akce na klick
    verifyUser() {
        this.authUser = firebase.auth().currentUser;
        if (this.authUser) {

            alert(`Welcome ${this.authUser.email}`);
            this.loggedInUser = this.authUser.email;
            this.userLoggedIn = true;
            this.router.navigate(['/admin']);
        }
    }

    login(loginEmail: string, loginPassword: string) {
        firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
            .catch(function(error) {
                alert(`${error.message} Unable to login. Try again!`);
        });
    }

    logout(){
        this.userLoggedIn = false;
        firebase.auth().signOut().then(function() {
            alert(`Logged Out!`);

        }, function(error) {
            alert(`${error.message} Unable to logout. Try again!`);
        });
    }

}