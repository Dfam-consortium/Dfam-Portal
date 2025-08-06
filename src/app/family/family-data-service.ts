// this utility allows family data to be shared between the family component and its routed children components
// used between family and family-browser 
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FamilyDataService {
  private familySubject = new BehaviorSubject<any>(null);
  family$ = this.familySubject.asObservable();

  setFamily(family: any) {
    this.familySubject.next(family);
  }

  getFamily(): any {
    return this.familySubject.value;
  }
}
