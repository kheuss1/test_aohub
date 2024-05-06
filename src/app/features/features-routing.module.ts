import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InscriptionComponent } from './inscription/inscription.component';
import { ConnexionComponent } from './connexion/connexion.component';
import { MotDePasseOublieProcessusComponent } from './mot-de-passe-oublie-processus/mot-de-passe-oublie-processus.component';
import { ParametresComponent } from './parametres/parametres.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';
import { AccountResetInitComponent } from './account-reset-init/account-reset-init.component';
import { HomeComponent } from './home/home.component';
import { OpportunitiesComponent } from './opportunities/opportunities.component';
import { ProjectSubmissionComponent } from './project-submission/project-submission.component';
import { ApplyProjectDialogComponent } from './apply-project-dialog/apply-project-dialog.component';
import { OpportunityTrackingComponent } from './opportunity-tracking/opportunity-tracking.component';
import { SupportComponent } from './support/support.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectOptionsComponent } from './project-options/project-options.component';
import { ActivityComponent } from './activity/activity.component';

const routes: Routes = [
  { path: 'signup', component: InscriptionComponent },
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: ConnexionComponent },
  { path: 'forget-password', component: MotDePasseOublieProcessusComponent },
  { path: 'setting', component: ParametresComponent },
  { path: 'account/activate', component: ActivateAccountComponent },
  { path: 'account/reset/finish', component: AccountResetInitComponent },
  { path: 'home', component: HomeComponent },
  { path: 'opportunities', component: OpportunitiesComponent },
  { path: 'project-submission', component: ProjectSubmissionComponent },
  { path: 'apply-project', component: ApplyProjectDialogComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'support', component: SupportComponent },
  { path: 'project-options', component: ProjectOptionsComponent },
  { path: 'activity', component: ActivityComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturesRoutingModule { }
