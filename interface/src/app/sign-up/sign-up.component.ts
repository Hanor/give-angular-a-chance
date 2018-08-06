import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { SignUpService } from './sign-up.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  requirements: Array<Requirement>;
  requirementsInvalid: number = -1;
  registerForm: FormGroup;
  registered: Boolean = false;
  subscriptions: Subscription = new Subscription();
  constructor(private formBuilder: FormBuilder, private signUpService: SignUpService) {}

  ngOnInit(): void {
    this.initializeForms();
  }
  confirmPasswordValidate(form: AbstractControl, passwordControl: AbstractControl) {
    let confirmationPasswordControl = form.get('confirmationPassword');
    if (!passwordControl.valid || passwordControl.value !== confirmationPasswordControl.value) {
      confirmationPasswordControl.setErrors(passwordControl.getError);
      return {invalid: true} 
    } else {
      confirmationPasswordControl.setErrors(null);
      return null;
    }
  }
  criarConta(): void {
    if (!this.registerForm.valid) {
      for (let key in this.registerForm.controls) {
        let control: AbstractControl = this.registerForm.controls[key];
        control.markAsTouched();
        if (key === 'password' && control instanceof FormControl) {
          this.passwordValidate(control);
        }
      }
    } else {
      this.signUpService.signUp(this.registerForm.getRawValue()).subscribe((response) => {
        if (response.registered) {
          this.registered = true;
        } else {
          throw new Error('Cannot register this user.');
        }
      });
    }
  }
  eventBlur(name: string) {
    let control = this.registerForm.get(name);
    control.markAsTouched();
  }
  eventPasswordChange(name: string) {
    let control = this.registerForm.get(name);
    if (control instanceof FormControl) {
      this.passwordValidate(control);
      this.eventBlur(name);
    }
  }
  getRequirementByName(name: string): Requirement {
    return this.requirements.filter((requirement: Requirement) => {
      return requirement.name === name;
    })[0];
  }
  initializeForms(): void {
    let self = this;
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordValidation]],
      confirmationPassword: ['',[Validators.required, passwordValidation]]
    });
    function passwordValidation(control: FormControl): {[s: string]: boolean} {
      return self.passwordValidation(self, control);
    }
    this.initializePasswordRequirements();
  }
  initializePasswordRequirements() {
    const passwordLengthRequirement = new Requirement();
    const passwordUpperCaseRequirement = new Requirement();
    const passwordNumberRequirement = new Requirement();

    passwordLengthRequirement.description = "Pelo menos 6 caracteres"
    passwordLengthRequirement.name = "length";
    passwordUpperCaseRequirement.description = "Pelo menos 1 caracteres maiúsculo"
    passwordUpperCaseRequirement.name = "upper";
    passwordNumberRequirement.description = "Pelo menos 1 número"
    passwordNumberRequirement.name = "number";
    this.requirements = [passwordLengthRequirement, passwordUpperCaseRequirement, passwordNumberRequirement];
  }
  passwordValidation(self: SignUpComponent, control: FormControl): {[s: string]: boolean}  {
    if (control && control.parent) {
      let form = control.parent;
      let passwordControl = form.get('password');
      if (passwordControl === control && control.value !== '') {
        if (form.get('confirmationPassword').touched) {
          self.confirmPasswordValidate(form, passwordControl);
        }
        return self.passwordValidate(control);
      } else {
        return self.confirmPasswordValidate(form, passwordControl);
      }
    }
  }
  passwordValidate(control: FormControl): {[s: string]: boolean} {
    let value: string = control.value;
    const requirementLength: Requirement = this.getRequirementByName('length');
    const requirementNumber: Requirement = this.getRequirementByName('number');
    const requirementUpper: Requirement = this.getRequirementByName('upper');

    this.requirementsInvalid = 0;
  
    if (requirementLength) {
      if ((value.length > 5)) {
        requirementLength.valid = true
      } else {
        requirementLength.valid = false;
        this.requirementsInvalid++;
      }

    }

    if (requirementNumber) {
      if (/[0-9]/.test(value)) {
        requirementNumber.valid = true;
      } else {
        requirementNumber.valid = false;
        this.requirementsInvalid++;
      }
    }

    if (requirementUpper) {
      if (/[A-Z]/.test(value)) {
        requirementUpper.valid = true;
      } else {
        requirementUpper.valid = false;
        this.requirementsInvalid++;
      }
    }
    if (this.requirementsInvalid === 0) {
      return null;
    } else {
      return {invalid: true};
    }
  }
}

class Requirement {
  description: string;
  valid: boolean;
  name: string
}