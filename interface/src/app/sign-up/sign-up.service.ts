import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor() { }
  
  signUp(formValue: any): Observable<any> {
    return Observable.create((subscriber) => {
      subscriber.next({registered: true});
    })
  }
}
