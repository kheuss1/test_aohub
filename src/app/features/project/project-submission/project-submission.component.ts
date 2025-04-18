import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { format } from 'date-fns';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Market } from '../../interfaces/market.model';
import { Domain } from '../../interfaces/domain.model';
import { ProjectService } from '../../services/project/project.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Disponibility } from '../../interfaces/disponibility.model';
import { ProjectVM } from '../../interfaces/project-vm.model';
import {
  AttachmentDto,
  AttachmentType,
} from '../../interfaces/attachment-dto.model';
import { digitOnly } from '../../interfaces/utils';
import { TranslateService } from '@ngx-translate/core';
import { EmployeePostDTO } from '../../interfaces/employee.model';

@Component({
  selector: 'app-project-submission',
  templateUrl: './project-submission.component.html',
  styleUrls: ['./project-submission.component.scss'],
})
export class ProjectSubmissionComponent implements OnInit {
  step: number = 1;
  minDate!: Date;
  titleSteps = ['MODALITY', 'ATTACHMENTS', 'TO_END'];
  stepsIcons = [
    [
      '../../../assets/img/modality.svg',
      '../../../assets/img/modality-green.svg',
    ],
    [
      '../../../assets/img/description.svg',
      '../../../assets/img/description-green.svg',
    ],

    [
      '../../../assets/img/success-grey.svg',
      '../../../assets/img/success-green.svg',
    ],
  ];
  projectSubmissionForm: FormGroup;
  minDateFinString!: string;
  applicationClosingDateToString!: string;
  processingEndDateToString!: string;
  token: string;

  //domains: Array<Domain> = [];
  //domainChoosen: Array<string> = [];
  project: ProjectVM = {};
  disponibilites: Array<Disponibility> = [];
  filesChoosen: Array<string> = [];
  plansChoosen: Array<string> = [];
  allFiles: Array<AttachmentDto> = [];
  displayContractDuration: boolean = false;
  domainTranslationMap: Record<string, string> = {
    Décolletage: 'BAR_TURNING',
    Plasturgie: 'PLASTICS_TRANSFORMATION',
    'Traitement de surface': 'SURFACE_TREATMENT',
    Assemblage: 'ASSEMBLY',
    Usinage: 'MACHINING',
    'Produit standard': 'STANDARD_PRODUCT',
    Découpe: 'CUTTING_STAMPING',
    Électronique: 'ELECTRONICS',
    'Découpe laser': 'LASER_CUTTING',
  };
  marketTranslationMap: Record<string, string> = {
    Automobile: 'AUTOMOBILE',
    Aéronautique: 'AERONAUTICS',
    Énergie: 'ENERGY',
    Électronique: 'ELECTRONICS',
    Spatial: 'SPACE',
    'R&D': 'R_AND_D',
    Ingénierie: 'ENGINEERING',
    Médical: 'MEDICAL',
    Aérospatial: 'AEROSPACE',
    Militaire: 'MILITARY',
    Industriel: 'INDUSTRIAL',
    'Mobilité urbaine': 'URBAN_MOBILITY',
    Autre: 'OTHER',
  };

  constructor(
    private toastr: ToastrService,
    private route: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private projectService: ProjectService,
    private translateService: TranslateService
  ) {
    authService.loggedOut();
    this.token = authService.isLogged()!;

    this.minDate = new Date();
    this.projectSubmissionForm = this.fb.group({
      intitule: new FormControl(null, [Validators.required]),
      service: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      confidentialite1: new FormControl(true, [Validators.required]),
      confidentialite2: new FormControl(false, [Validators.required]),
      typeDeBesoin: new FormControl(null, [Validators.required]),
      duree: new FormControl(null),
      volumeGlobal: new FormControl(null, [Validators.required]),
      budget: new FormControl(null, [Validators.required]),
      applicationClosingDate: new FormControl(null, [Validators.required]),
      processingEndDate: new FormControl(null, [Validators.required]),
    });

    const dayStart = new Date();
    const dayEnd = new Date();

    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 50, 0, 0);

    this.projectSubmissionForm.patchValue({
      applicationClosingDate: format(dayStart, 'yyyy-MM-dd'),
      processingEndDate: format(dayEnd, 'yyyy-MM-dd'),
    });

    // pour afficher uniquement les date posterieur
    this.minDateFinString = format(dayStart, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    const applicationClosingDateControl: any = this.projectSubmissionForm.get(
      'applicationClosingDate'
    );
    const processingEndDateControl: any =
      this.projectSubmissionForm.get('processingEndDate');
    processingEndDateControl.valueChanges.subscribe((value: any) => {
      if (value) {
        const dateFin = new Date(value);
        this.processingEndDateToString = format(dateFin, 'yyyy-MM-dd');
      }
    });

    applicationClosingDateControl.valueChanges.subscribe((value: any) => {
      if (value) {
        this.projectSubmissionForm.patchValue({
          endDate: value,
        });

        this.minDateFinString = value;
        const dateFin = new Date(value);
        this.processingEndDateToString = format(dateFin, 'yyyy-MM-dd');
      }

      const dateDebut = new Date(this.projectSubmissionForm.value.startDate);

      this.applicationClosingDateToString = format(dateDebut, 'yyyy-MM-dd');
    });
    /*
     this.projectService.getAllDomains(this.token).subscribe({
      next: (data) => {
        this.domains = data.map((item: Domain) => ({
          ...item,
          translatedName: this.domainTranslationMap[item.name] || item.name,
        }));
      },
      error: (err) => {
        console.log(err);
        this.translateService
          .get(['ERROR_FETCHING_DOMAINS', 'ERROR_TITLE'])
          .subscribe((translations) => {
            this.toastr.error(
              translations['ERROR_FETCHING_DOMAINS'],
              translations['ERROR_TITLE'],
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
              }
            );
          });
      },
    });*/
  }

  getControl(controlName: string) {
    return this.projectSubmissionForm.get(controlName);
  }

  nextStep() {
    if (this.step < 3) this.step++;
    else this.submit();
  }

  backStep() {
    if (this.step > 1) this.step--;

    if (this.step >= 4) {
      this.projectSubmissionForm.reset();
      this.route.navigate(['/home']);
    }
  }

  submit() {
    if (this.projectSubmissionForm.invalid) {
      this.translateService
        .get([
          'ERROR_FIELD_NOT_CONFORM_PROJECT_SUBMISSION',
          'ERROR_PROJECT_SUBMISSION_TITLE',
        ])
        .subscribe((translations) => {
          this.toastr.error(
            translations['ERROR_FIELD_NOT_CONFORM_PROJECT_SUBMISSION'],
            translations['ERROR_PROJECT_SUBMISSION_TITLE'],
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            }
          );
        });
    } else {
      const formvalue = this.projectSubmissionForm.value;
      this.project.service = formvalue.service;
      this.project.budget = formvalue.budget;
      this.project.confidential = formvalue.confidentialite1
        ? formvalue.confidentialite1
        : formvalue.confidentialite2;
      this.project.description = formvalue.description;

      //     this.project.domains = this.domains.filter((domain) =>
      //     this.domainChoosen.includes(domain.name)
      // );
      this.project.duration = formvalue.duree;
      this.project.applicationClosingDate = formvalue.applicationClosingDate;
      this.project.globalVolume = formvalue.volumeGlobal;
      this.project.processingEndDate = formvalue.processingEndDate;

      this.project.needType = formvalue.typeDeBesoin;

      this.project.title = formvalue.intitule;
      console.log(this.project);

      this.projectService.addProject(this.token, this.project).subscribe({
        next: (data) => {
          this.allFiles.forEach((file) => {
            file.project = data;
            this.projectService
              .addProjectAttachments(this.token, file)
              .subscribe({
                next: (data) => {},
                error: (err) => {},
              });
          });
          this.translateService
            .get(['SUCCESS_PROJECT_SUBMISSION', 'SUCCESS_TITLE'])
            .subscribe((translations) => {
              this.toastr.success(
                translations['SUCCESS_PROJECT_SUBMISSION'],
                translations['SUCCESS_TITLE'],
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                }
              );
            });
          this.step++;
        },
        error: (err) => {
          this.translateService
            .get(['ERROR_PROJECT_SUBMISSION', 'ERROR_TITLE'])
            .subscribe((translations) => {
              this.toastr.error(
                translations['ERROR_PROJECT_SUBMISSION'],
                translations['ERROR_TITLE'],
                {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                }
              );
            });
        },
      });
    }
  }

  handleChange(fieldName: string) {
    const otherField =
      fieldName === 'confidentialite1'
        ? 'confidentialite2'
        : 'confidentialite1';
    if (this.projectSubmissionForm.get(fieldName)?.value) {
      this.projectSubmissionForm.get(otherField)?.setValue(false);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    digitOnly(event);
  }

  /*onSelectDomain(value: any) {
    if (this.domainChoosen.indexOf(value) === -1)
      this.domainChoosen.push(value);
  }

  removeDomain(item: string) {
    this.domainChoosen.splice(this.domainChoosen.indexOf(item), 1);
  }*/

  onSetStep(value: number) {
    if (value != 5) this.step = value;
  }

  gotoHome() {
    this.route.navigate(['/home']);
  }

  onFileSelected(event: any, indice: number) {
    const files: FileList = event.target.files;

    if (indice === 1) {
      this.filesChoosen = [];
    } else {
      this.plansChoosen = [];
    }

    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        if (indice === 1) {
          let attachment: AttachmentDto = {
            name: file.name,
            type: AttachmentType.NORMAL,
            fileSize: file.size,
            base64Content: base64String,
          };
          this.filesChoosen.push(file.name);
          this.allFiles.push(attachment);
        } else {
          let attachment: AttachmentDto = {
            name: file.name,
            type: AttachmentType.PLAN,
            fileSize: file.size,
            base64Content: base64String,
          };
          this.plansChoosen.push(file.name);
          this.allFiles.push(attachment);
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }

  onTypeDeBesoinSelected(event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue === 'CONTRACT') {
      this.displayContractDuration = true;
    } else {
      this.displayContractDuration = false;
    }
  }

  translateDomain(domain: string) {
    return this.domainTranslationMap[domain] || domain;
  }
}
