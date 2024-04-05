import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { format } from 'date-fns';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Market } from '../interfaces/market.model';
import { Project } from '../interfaces/project.model';
import { Domain } from '../interfaces/domain.model';
import { ProjectService } from '../services/project/project.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Disponibility } from '../interfaces/disponibility.model';
import { data } from 'jquery';
import { ProjectVM } from '../interfaces/project-vm.model';

@Component({
  selector: 'app-project-submission',
  templateUrl: './project-submission.component.html',
  styleUrls: ['./project-submission.component.scss']
})
export class ProjectSubmissionComponent implements OnInit {

  step: number = 1;
  titleSteps = ["Modalités", "Pièces jointes", "Lancement", "Terminer"];
  stepsIcons = [
    ["../../../assets/img/modality.svg", "../../../assets/img/modality-green.svg"],
    ["../../../assets/img/description.svg", "../../../assets/img/description-green.svg"],
    ["../../../assets/img/date-time.svg", "../../../assets/img/date-time-green.svg"],
    ["../../../assets/img/success-grey.svg", "../../../assets/img/success-green.svg"]
  ];
  projectSubmissionForm: FormGroup;
  metiers = [
    "Plasturgie", "Sourcing", "Prototypist", "Assemblage", "Metallurgie", "Technicien", "Chef De Projet"
  ];

  heureDebutNumber!: number;
  minuteDebutNumber!: number;
  heureFinNumber!: number;
  minuteFinNumber!: number;
  minDateFinString!: string;
  startDateToString!: string;
  endDateToString!: string;
  token: string;
  selectedDate!: Date | null;
  allDateChoosen: Array<string> = [];
  markets: Array<Market> = [];
  market: Array<Market> = [];
  domains: Array<Domain> = [];
  domainChoosen: Array<string> = [];
  project: ProjectVM = {};
  disponibilites: Array<Disponibility> = [];


  constructor(private toastr: ToastrService, private route: Router, private fb: FormBuilder, private authService: AuthService, private projectService: ProjectService) {
    authService.loggedOut();
    this.token = authService.isLogged()!;

    this.projectSubmissionForm = this.fb.group({
      intitule: new FormControl(null, [Validators.required]),
      client: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      // metier: new FormControl(null, [Validators.required]),
      confidentialite1: new FormControl(true, [Validators.required]),
      confidentialite2: new FormControl(false, [Validators.required]),
      marche: new FormControl(null, [Validators.required]),
      prixCible: new FormControl(null, [Validators.required]),
      typeDeBesoin: new FormControl(null, [Validators.required]),
      duree: new FormControl(null, [Validators.required]),
      volumeGlobal: new FormControl(null, [Validators.required]),
      budget: new FormControl(null, [Validators.required]),
      // delaiPlusTot: new FormControl(null, [Validators.required]),
      // delaiPlusTard: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      heure: new FormControl(null, [Validators.required]),
      // heureFin: new FormControl(null, [Validators.required]),
    });

    const dayStart = new Date();
    const dayEnd = new Date();

    // Définissez l'heure, les minutes et les secondes à zéro
    dayStart.setHours(0, 0, 0, 0);
    dayEnd.setHours(23, 50, 0, 0);

    this.projectSubmissionForm.patchValue({
      startDate: format(dayStart, 'yyyy-MM-dd'),
      endDate: format(dayEnd, 'yyyy-MM-dd')
    });

    // pour afficher uniquement les date posterieur
    this.minDateFinString = format(dayStart, 'yyyy-MM-dd')

  }

  ngOnInit(): void {
    const startDateControl: any = this.projectSubmissionForm.get('startDate');
    const endDateControl: any = this.projectSubmissionForm.get('endDate');
    endDateControl.valueChanges.subscribe((value: any) => {

      if (value) {
        const dateFin = new Date(value);
        this.endDateToString = format(dateFin, 'yyyy-MM-dd');
      }

    });

    startDateControl.valueChanges.subscribe((value: any) => {
      if (value) {
        this.projectSubmissionForm.patchValue({
          endDate: value
        });

        this.minDateFinString = value;
        const dateFin = new Date(value);
        this.endDateToString = format(dateFin, 'yyyy-MM-dd');
      }

      const dateDebut = new Date(this.projectSubmissionForm.value.startDate);

      this.startDateToString = format(dateDebut, 'yyyy-MM-dd');

    });

    this.projectService.getAllDomains(this.token).subscribe({
      next: (data) => {
        this.domains = data;
        console.log(this.domains);

      },
      error: (err) => {

      }
    });

    this.projectService.getAllMarkets(this.token).subscribe({
      next: (data) => {
        this.markets = data;
        console.log(this.markets);

      },
      error: (err) => {

      }
    });
  }


  getControl(controlName: string) {
    return this.projectSubmissionForm.get(controlName);
  }

  nextStep() {
    if (this.step < 4)
      this.step++;
    else
      this.submit();
  }

  backStep() {
    if (this.step > 1)
      this.step--;

    if (this.step >= 4) {
      this.projectSubmissionForm.reset();
      this.route.navigate(['/home']);

    }
  }

  submit() {
    console.log(this.projectSubmissionForm.value);
    if (this.projectSubmissionForm.invalid || this.domainChoosen.length === 0 || this.allDateChoosen.length === 0) {
      this.toastr.error("veillez bien remplir tous les champs correctement", "Erreur soumission projet", {
        timeOut: 3000,
        positionClass: 'toast-top-center',
     });
    }
    else {

      const formvalue = this.projectSubmissionForm.value;
      this.project.client = formvalue.client;
      this.project.budget = formvalue.budget;
      this.project.confidential = formvalue.confidentialite1 ? formvalue.confidentialite1 : formvalue.confidentialite2;
      this.project.description = formvalue.description;
      this.project.disponibilityInstants = this.allDateChoosen;
      this.project.domains = this.domains.filter(domain => this.domainChoosen.includes(domain.name));
      this.project.duration = formvalue.duree;
      this.project.earliestDeadline = formvalue.startDate;
      this.project.globalVolume = formvalue.volumeGlobal;
      this.project.latestDeadline = formvalue.endDate;
      this.project.markets = this.markets.filter(market => market === formvalue.marche);;
      this.project.needType = formvalue.typeDeBesoin;
      this.project.targetPrice = formvalue.prixCible;
      this.project.title = formvalue.intitule;
      console.log(this.project);

      this.projectService.addProject(this.token, this.project).subscribe({
        next: (data) => {
          console.log(data);
          this.toastr.success("La soumission du projet a bien été effectué", "Succés", {
            timeOut: 3000,
            positionClass: 'toast-top-center',
         });
         this.step++;
        },
        error: (err) => {
          this.toastr.error("La soumission du projet a échoué", "Erreur soumission projet", {
            timeOut: 3000,
            positionClass: 'toast-top-center',
         });
        }
      })

    }
  }

  handleChange(fieldName: string) {
    const otherField = fieldName === 'confidentialite1' ? 'confidentialite2' : 'confidentialite1';
    if (this.projectSubmissionForm.get(fieldName)?.value) {
      this.projectSubmissionForm.get(otherField)?.setValue(false);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    const allowedChars = /^[0-9]+$/; // Expression régulière pour n'accepter que des chiffres

    // Vérifier si la touche saisie est autorisée
    if (!allowedChars.test(event.key)) {
      event.preventDefault(); // Empêcher la saisie du caractère non autorisé
    }
  }

  ajouterDate() {
    const [heures, minutes] = this.projectSubmissionForm.value.heure.split(':').map(Number);
    console.log(this.selectedDate + ' ' + heures + '-- ' + minutes);
    this.selectedDate?.setHours(heures, minutes);
    console.log(this.selectedDate);
    if (this.allDateChoosen.indexOf(this.selectedDate?.toISOString()!) === -1)
      this.allDateChoosen.push(this.selectedDate?.toISOString()!);
  }

  newCreneau() {
    this.selectedDate = null;
    this.projectSubmissionForm.get('heure')?.setValue('00:00');
  }

  onSelectDomain(value: any) {
    console.log(value);

    if (this.domainChoosen.indexOf(value) === -1)
      this.domainChoosen.push(value);
    console.log(this.domainChoosen);

  }

  removeDomain(item: string) {
    this.domainChoosen.splice(this.domainChoosen.indexOf(item), 1);
  }
}
