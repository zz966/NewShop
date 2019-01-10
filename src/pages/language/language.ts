import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoadingProvider } from '../../providers/loading/loading';
import { TranslateService } from '@ngx-translate/core';
import { Http } from '@angular/http';
import { ConfigProvider } from '../../providers/config/config';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';

@Component({
  selector: 'page-language',
  templateUrl: 'language.html',
})
export class LanguagePage {
  language: any;
  languageList = [];
  currentLanguageCode = localStorage.languageCode;
  constructor(
    public navCtrl: NavController,
    public loading: LoadingProvider,
    public viewCtrl: ViewController,
    public config: ConfigProvider,
    public navParams: NavParams,
    public shared: SharedDataProvider,
    public http: Http,
    translate: TranslateService) {

    this.getListOfLanguages();
  }

  getListOfLanguages() {
    this.loading.show();
    this.http.get(this.config.url + "/api/appsettings/get_all_languages/?insecure=cool").map(res => res.json()).subscribe(data => {
      this.loading.hide();
      this.languageList = data.data;
      this.languageList.forEach(val => {
        if (val.code == this.currentLanguageCode)
          this.language = val;
      });
    });
  }
  updateLanguage() {
    if (this.currentLanguageCode != this.language.code) {
      this.loading.autoHide(1000);
      localStorage.languageCode = this.language.code;
      localStorage.languageDirection = this.language.direction;
      this.shared.emptyCart();
      this.shared.emptyRecentViewed();
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }
  //close modal
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
