import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Project } from '../interfaces/project.model';
import { EventService } from '../services/event/event.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-popup-add-event',
  templateUrl: './popup-add-event.component.html',
  styleUrls: ['./popup-add-event.component.scss']
})
export class PopupAddEventComponent implements OnInit {
  addEventForm: FormGroup;
  token: string;
  project: Project;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PopupAddEventComponent>,
    private fb: FormBuilder, 
    private eventService: EventService,
    private toastr: ToastrService
    ) {
      this.token = this.dialogData.token;
      this.project = this.dialogData.project;

      this.addEventForm = this.fb.group({
        title: [''],
        start: [],
        timeEvent: []
      })
  }
  ngOnInit() {
  }

  getControl(controlName: string) {
    return this.addEventForm.get(controlName);
  }

  submit() {
    const formValue = this.addEventForm.value;
    const payload = {
      title: this.addEventForm.get('title')?.value,
      start: this.addEventForm.get('start')?.value,
      project: {
        id: this.project.id
      }
    };

    this.eventService.addEvent(this.token, payload).subscribe({
      next: (data) => {
        console.log(data);
        this.toastr.success("Cet évènement a été ajouté avec succès", "Succès !", {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        this.dialogRef.close();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error.detail, "Erreur lors de l'ajout de l'évènement", {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
    })
  }

}
