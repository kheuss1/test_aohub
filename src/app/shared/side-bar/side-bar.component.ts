import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  screenSize: string = "sm";
  optionsTop = [
    ["../../../assets/img/home.svg", "Accueil", "/accueil"],
    ["../../../assets/img/projects.svg", "Mes projets", "/projets"],
    ["../../../assets/img/opportunity.svg", "Opportunités", "/opportinutes"],
    ["../../../assets/img/activity.svg", "Activités", "/activite"],
    ["../../../assets/img/notification.svg", "Notifications", "/notification"]
  ];

  optionsBottom = [
    ["../../../assets/img/star.svg", "Avis", "/avis"],
    ["../../../assets/img/support.svg", "Support", "/support"],
    ["../../../assets/img/setting.svg", "Parametres", "/setting"]
  ];
  viewText: boolean = true;

  onHamburger() {
    this.viewText = !this.viewText;
  }

  constructor(private route: Router) {
    // Initialisez la taille de l'écran lors du chargement de la page
    console.log(window.innerWidth);

    this.updateScreenSize(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Mettez à jour la taille de l'écran lors du redimensionnement de la fenêtre
    this.updateScreenSize(event.target.innerWidth);
  }

  private updateScreenSize(width: number): void {
    if (width >= 1200) {
      this.screenSize = 'lg';
    } else if (width >= 992) {
      this.screenSize = 'md';
    } else {
      this.screenSize = 'sm';
    }
  }

  humburger() {

  }

  navigation(link: string) {
    this.route.navigate([link]);
  }
}
