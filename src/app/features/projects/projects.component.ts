import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ProjectService } from '../services/project/project.service';
import { UserService } from '../services/user/user.service';
import { PartnerDTO } from '../interfaces/partner.model';
import { Project } from '../interfaces/project.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  token: string;
  totalItems = 0;
  itemPerPage = 4;
  currentPage = 1;
  listProject: Project[] = [];
  currentConnectedUser?: PartnerDTO;
  nbProjectsInProgres: number = 0;
  nbProjectsFinished: number = 0;
  nbProjectsOnHold: number = 0;
  nbProjectsArchived: number = 0;
  selectedDate: Date | null = new Date();

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService) {
      authService.loggedOut();
      this.token = authService.isLogged()!;
  }

  ngOnInit(): void {
    if(window.innerHeight < 600) {
      this.itemPerPage = 2;
    }
    this.loadCurrentConnectedUser();
    this.loadMyProjects(this.currentPage - 1, this.itemPerPage);    
  }

  loadCurrentConnectedUser() {
    const userData = localStorage.getItem("currentConnectedUser");
    if (userData) {
      this.currentConnectedUser = JSON.parse(userData);
      
    } else {
      this.userService.getUser(this.token).subscribe({
        next: (data) => {
          this.currentConnectedUser = data; 
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err.error.detail, "Erreur sur la réception de l'utilisateur connecté", {
            timeOut: 3000,
            positionClass: 'toast-right-right',
         });
        }
      })
    }
  }

  loadMyProjects(page: number, size: number) {
    this.listProject.splice(0, this.listProject.length);

    this.projectService.getMyProjects(this.token, page, size).subscribe({
      next: (data) => {
        this.listProject.push(data.projects);
        this.listProject = this.listProject.flatMap(data => data);
        this.totalItems = data.totalCount;

        this.listProject.forEach(project => {
          switch(project.status) {
            case 'IN_PROGRESS':
              this.nbProjectsInProgres++;
              break;
            case 'FINISHED':
              this.nbProjectsFinished++;
              break;
            case 'ON_HOLD':
              this.nbProjectsOnHold++;
              break;
            case 'ARCHIVED':
              this.nbProjectsArchived++;
              break;
            default:
              break;
          }
        });
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(err.error.detail, "Erreur sur la réception de la liste des projets", {
          timeOut: 3000,
          positionClass: 'toast-top-center',
       });
      }
    });
  }

  changePage(page: number) {
    if(window.innerHeight < 600) {
      this.itemPerPage = 2;
    }
    this.currentPage = page;
    this.loadMyProjects(this.currentPage - 1, this.itemPerPage);
  }

  changeFilter(value: string, flagUrl: string) {
  }

  displayProjectDetails(id: number) {
    this.router.navigate(['/project-options'], { queryParams: { id: id } });
  }

  onSelectDate(event: Event) {
    console.log(this.selectedDate);
  }

}
