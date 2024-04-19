import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-selectionner-langue',
  templateUrl: './selectionner-langue.component.html',
  styleUrls: ['./selectionner-langue.component.scss']
})
export class SelectionnerLangueComponent {
  flagUrl: string = '../../../assets/flags/fr_flag.svg';

  constructor(private translate: TranslateService,) {

  }

  changeLanguage(value: string, flagUrl: string) {
    this.flagUrl = flagUrl;
    this.translate.use(value);
    localStorage.setItem('language', value);
  }
}
