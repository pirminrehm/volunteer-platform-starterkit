import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { customErrorCodes, PostVolunteer } from '@wir-vs-virus/api-interfaces';
// import { RecaptchaComponent } from 'ng-recaptcha';
import { Observable } from 'rxjs';
import { first, map, startWith, tap } from 'rxjs/operators';
import { VolunteerService } from '../services/volunteer.service';
import { phoneRegExp, zipCodeRegExp } from '../../common/utils';
import { medicalQualifications } from './medical-qualifications';

@Component({
  selector: 'wir-vs-virus-register-volunteer',
  templateUrl: './register-volunteer.component.html',
  styleUrls: ['./register-volunteer.component.scss']
})
export class RegisterVolunteerComponent implements OnInit {
  showPrivacyError = false;
  volunteerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(70)]),
    zipCode: new FormControl('', [
      Validators.required,
      Validators.pattern(zipCodeRegExp)
    ]),
    knowledge: new FormControl('', [
      Validators.required,
      Validators.maxLength(300)
    ]),

    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(phoneRegExp)
    ]),
    mail: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(70)
    ]),
    qualifications: new FormControl(''),
    agreePrivacy: new FormControl(false, Validators.requiredTrue)
    // disabled: recaptcha
    // recaptcha: new FormControl(null, [Validators.required])
  });

  // disabled: recaptcha
  // @ViewChild(RecaptchaComponent)
  // captchaRef: RecaptchaComponent;

  @ViewChild('qualificationInput') qualificationInput: ElementRef<
    HTMLInputElement
  >;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredQualifications: Observable<string[]>;
  qualifications: string[] = [];
  allQualifications: string[] = medicalQualifications;
  sendingRequest = false;
  errorMessages: { target; value; property; children; constraints }[] = [];

  constructor(
    private router: Router,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.filteredQualifications = this.volunteerForm
      .get('qualifications')
      .valueChanges.pipe(
        // tslint:disable-next-line: deprecation
        startWith(null),
        map((qualification: string | null) =>
          qualification
            ? this._filter(qualification)
            : this.allQualifications.slice()
        )
      );
  }

  onSubmit() {
    // disabled: recaptcha
    // this.volunteerForm.get('recaptcha').markAllAsTouched();
    this.showPrivacyError = !!this.volunteerForm.get('agreePrivacy').errors;
    if (!this.volunteerForm.valid || this.qualifications.length === 0) {
      return;
    }

    const val = this.volunteerForm.value;

    const volunteer: PostVolunteer = {
      description: val.knowledge,
      email: val.mail,
      qualification: this.qualifications,
      name: val.name,
      phone: val.phone,
      zipcode: Number(val.zipCode),
      // disabled: recaptcha
      // recaptcha: val.recaptcha,
      recaptcha: '',
      privacyAccepted: val.agreePrivacy
    };
    console.log(volunteer);

    this.sendingRequest = true;
    this.volunteerService
      .create(volunteer)
      .pipe(first(), tap(console.log))
      .subscribe(
        res => {
          console.log(res);
          this.router.navigate(['/register-volunteer/success']);
        },
        err => {
          this.sendingRequest = false;
          console.error(err.error.message);
          // disabled: recaptcha
          // this.captchaRef.reset();
          this.errorMessages = undefined;
          const validatorErrors = err.error.message[0]?.children;
          if (validatorErrors) {
            this.errorMessages = validatorErrors;
            return;
          }

          switch (err.error.message) {
            case customErrorCodes.ZIP_NOT_FOUND:
              this.volunteerForm.get('zipCode').setErrors({
                notExists: true
              });
              break;
            case customErrorCodes.CAPTCHA_NOT_FOUND:
              break;
            default:
              // if an unknow error appears, show user a fallback message
              alert(
                'Etwas ist schief gelaufen, versuchen Sie es später nochmal.'
              );
              break;
          }
        }
      );
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our qualification
    if ((value || '').trim()) {
      this.qualifications.push(value.trim());
      // this.volunteerForm.get('qualifications').setValue(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.volunteerForm.get('qualifications').setValue(null);
  }

  remove(qualification: string): void {
    const index = this.qualifications.indexOf(qualification);

    if (index >= 0) {
      this.qualifications.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.qualifications.push(event.option.viewValue);
    this.qualificationInput.nativeElement.value = '';
    this.volunteerForm.get('qualifications').setValue(null);
  }

  private _filter(value: string): string[] {
    console.log(value);
    if (value) {
      let filterValue = '';
      filterValue = value.toLowerCase();

      return this.allQualifications.filter(
        qualification => qualification.toLowerCase().indexOf(filterValue) === 0
      );
    }
    return this.allQualifications;
  }
}
