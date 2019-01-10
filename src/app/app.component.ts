// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/

import { Component, ViewChild, ApplicationRef } from '@angular/core';
import { Nav, Platform, ModalController, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from '../pages/home/home';
import { IntroPage } from '../pages/intro/intro';
import { ContactUsPage } from '../pages/contact-us/contact-us';
import { AboutUsPage } from '../pages/about-us/about-us';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { LoginPage } from '../pages/login/login';
import { ConfigProvider } from '../providers/config/config';
import { SharedDataProvider } from '../providers/shared-data/shared-data';
import { CategoriesPage } from '../pages/categories/categories';
import { WishListPage } from '../pages/wish-list/wish-list';
import { MyAccountPage } from '../pages/my-account/my-account';
import { MyOrdersPage } from '../pages/my-orders/my-orders';
import { NewsPage } from '../pages/news/news';
import { ProductsPage } from '../pages/products/products';
import { SettingsPage } from '../pages/settings/settings';
import { Network } from '@ionic-native/network';
import { AlertProvider } from '../providers/alert/alert';
import { LoadingProvider } from '../providers/loading/loading';
import { Home2Page } from '../pages/home2/home2';
import { Home3Page } from '../pages/home3/home3';
import { Home4Page } from '../pages/home4/home4';
import { Home5Page } from '../pages/home5/home5';
import { Categories2Page } from '../pages/categories2/categories2';
import { Categories4Page } from '../pages/categories4/categories4';
import { Categories5Page } from '../pages/categories5/categories5';
import { Categories3Page } from '../pages/categories3/categories3';
import { Categories6Page } from '../pages/categories6/categories6';
import { trigger, transition, animate, style } from '@angular/animations';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';
import { AppVersion } from '@ionic-native/app-version';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AddressesPage } from '../pages/addresses/addresses';
import { DownloadsPage } from '../pages/downloads/downloads';
import { LanguagePage } from '../pages/language/language';

@Component({
  animations: [
    trigger(
      'animate', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('500ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('500ms', style({ opacity: 0 }))
        ])
      ]
    )
  ],
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  homeList = false;
  homeListIcon = 'add';
  categoriesList = false;
  categoriesListIcon = 'add';
  shopList = false;
  shopListIcon = 'add';


  constructor(
    public config: ConfigProvider,
    public shared: SharedDataProvider,
    
    public platform: Platform,
    public modalCtrl: ModalController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    translate: TranslateService,
    public storage: Storage,
    public network: Network,
    public alert: AlertProvider,
    public loading: LoadingProvider,
    private admobFree: AdMobFree,
    public events: Events,
    public plt: Platform,
    private appVersion: AppVersion,
    public iab: InAppBrowser,
    private socialSharing: SocialSharing,
    private applicationRef: ApplicationRef
  ) {

    
    //if (!this.platform.is('cordova')) this.rootPage = HomePage;
    this.initializeApp();

    let connectedToInternet = true;
    network.onDisconnect().subscribe(() => {
      connectedToInternet = false;
      translate.get(["Please Connect to the Internet!", "Disconnected"]).subscribe((res) => {
        this.alert.showWithTitle(res["Please Connect to the Internet!"], res["Disconnected"]);
      });
      //  console.log('network was disconnected :-(');

    });


    network.onConnect().subscribe(() => {
      if (!connectedToInternet) {
        window.location.reload();
        //this.loading.show();
        //console.log('network connected!');
        translate.get(["Network connected Reloading Data", "Connected"]).subscribe((res) => {
          this.alert.showWithTitle(res["Network connected Reloading Data"] + '...', res["Connected"]);
        });

      }
      //connectSubscription.unsubscribe();
    });
    this.platform.setDir(this.config.appDirection, true);
    shared.dir = this.config.appDirection;
    //setting default languge on start up 
    translate.setDefaultLang(this.config.url + '/api/appsettings/get_all_labels/?insecure=cool&lang_code=' + this.config.languageCode);

    events.subscribe('showAd', () => {
      this.showInterstitial();
    });
  }
  initializeApp() {

    this.config.siteSetting().then((value) => {

      this.loadHomePage();
      this.platform.ready().then(() => {

      });

    });
  }

  // loading home page =========================================================================
  loadHomePage() {

    this.storage.get('firsttimeApp').then((val) => {
      let value = val;
      if (this.config.showIntroPage == 0) value = 'firstTime';
      if (value == 'firstTime') {
        if (this.config.homePage == 1) { this.rootPage = HomePage; }
        if (this.config.homePage == 2) { this.rootPage = Home2Page; }
        if (this.config.homePage == 3) { this.rootPage = Home3Page; }
        if (this.config.homePage == 4) { this.rootPage = Home4Page; }
        if (this.config.homePage == 5) { this.rootPage = Home5Page; }
      }
      else {
        this.nav.push(IntroPage);
      }
      this.storage.set('firsttimeApp', 'firstTime');

      setTimeout(() => {
        this.splashScreen.hide();
      }, 400);

    });
    this.statusBar.backgroundColorByHexString('#8096bf');
    //subscribe for push notifiation
    this.shared.subscribePush();
    this.runAdmob();
    this.shared.privacyPolicy = this.config.privacyPolicy;
    this.shared.termServices = this.config.termServices;
    this.shared.refundPolicy = this.config.refundPolicy;
    this.shared.aboutUs = this.config.aboutUs;
  }
  // starting admob =========================================================================
  runAdmob() {
    if (this.plt.is('ios')) {
      if (this.config.admobIos == 1) this.initializeAdmob(this.config.admobBanneridIos, this.config.admobIntidIos);
      this.config.admob = this.config.admobIos;
      this.shared.device = 'ios';
    } else if (this.plt.is('android')) {
      if (this.config.admob == 1) this.initializeAdmob(this.config.admobBannerid, this.config.admobIntid);
      this.shared.device = 'android';
    }
  }
  // preparing admob =========================================================================
  initializeAdmob(bannerId, intId) {
    if (this.platform.is('cordova')) {
      const bannerConfig: AdMobFreeBannerConfig = {
        id: bannerId,
        isTesting: false,
        autoShow: true
      };
      this.admobFree.banner.config(bannerConfig);

      this.admobFree.banner.prepare()
        .then(() => {
          //alert("loaded" +bannerId);
          //this.admobFree.banner.show();
        })
        .catch(e => console.log(e));

      const interstitialConfig: AdMobFreeInterstitialConfig = {
        id: intId,
        isTesting: false,
        autoShow: false
      };
      this.admobFree.interstitial.config(interstitialConfig);
      this.admobFree.interstitial.prepare();
    }
  }
  //=========================================================================
  showInterstitial() {
    if (this.platform.is('cordova')) {
      this.admobFree.interstitial.isReady().then(() => {
        this.admobFree.interstitial.show();
      });
      this.admobFree.interstitial.prepare();
    }
  }
  //=========================================================================
  openPage(page) {
    if (page == 'home') this.openHomePage();
    else if (page == 'home1') this.nav.setRoot(HomePage);
    else if (page == 'home2') this.nav.setRoot(Home2Page);
    else if (page == 'home3') this.nav.setRoot(Home3Page);
    else if (page == 'home4') this.nav.setRoot(Home4Page);
    else if (page == 'home5') this.nav.setRoot(Home5Page);
    else if (page == 'categories') this.openCategoryPage();
    else if (page == 'categories1') this.nav.setRoot(CategoriesPage);
    else if (page == 'categories2') this.nav.setRoot(Categories2Page);
    else if (page == 'categories3') this.nav.setRoot(Categories3Page);
    else if (page == 'categories4') this.nav.setRoot(Categories4Page);
    else if (page == 'categories5') this.nav.setRoot(Categories5Page);
    else if (page == 'categories6') this.nav.setRoot(Categories6Page);
    else if (page == 'products') this.nav.setRoot(ProductsPage);
    else if (page == 'myWishList') this.nav.setRoot(WishListPage);
    else if (page == 'myAccount') this.nav.setRoot(MyAccountPage);
    else if (page == 'myOrders') this.nav.setRoot(MyOrdersPage);
    else if (page == 'addresses') this.nav.setRoot(AddressesPage);
    else if (page == 'downloads') this.nav.setRoot(DownloadsPage);
    else if (page == 'contactUs') this.nav.setRoot(ContactUsPage);
    else if (page == 'aboutUs') this.nav.setRoot(AboutUsPage);
    else if (page == 'news') this.nav.setRoot(NewsPage);
    else if (page == 'intro') this.nav.setRoot(IntroPage);
    else if (page == 'settings') this.nav.setRoot(SettingsPage);
    else if (page == 'latest') this.nav.push(ProductsPage, { type: 'latest' });//<!-- 2.0 updates start -->
    else if (page == 'sale') this.nav.push(ProductsPage, { type: 'sale' });
    else if (page == 'featured') this.nav.push(ProductsPage, { type: 'featured' });//<!-- 2.0 updates start -->

  }
  openHomePage() {
    if (this.config.homePage == 1) { this.nav.setRoot(HomePage); }
    if (this.config.homePage == 2) { this.nav.setRoot(Home2Page); }
    if (this.config.homePage == 3) { this.nav.setRoot(Home3Page); }
    if (this.config.homePage == 4) { this.nav.setRoot(Home4Page); }
    if (this.config.homePage == 5) { this.nav.setRoot(Home5Page); }
  }
  openCategoryPage() {
    if (this.config.categoryPage == 1) { this.nav.setRoot(CategoriesPage); }
    if (this.config.categoryPage == 2) { this.nav.setRoot(Categories2Page); }
    if (this.config.categoryPage == 3) { this.nav.setRoot(Categories3Page); }
    if (this.config.categoryPage == 4) { this.nav.setRoot(Categories4Page); }
    if (this.config.categoryPage == 5) { this.nav.setRoot(Categories5Page); }
    if (this.config.categoryPage == 6) { this.nav.setRoot(Categories6Page); }
  }


  openLoginPage() {
    let modal = this.modalCtrl.create(LoginPage, { hideGuestLogin: true });// <!-- 2.0 updates -->
    modal.present();
  }
  openSignUpPage() {
    let modal = this.modalCtrl.create(SignUpPage);
    modal.present();
  }
  logOut() {
    this.shared.logOut();
  }
  showHideHomeList() {
    if (this.homeList == false) { this.homeList = true; this.homeListIcon = 'remove'; }
    else { this.homeList = false; this.homeListIcon = 'add'; }
  }
  showHideCategoriesList() {
    if (this.categoriesList == false) { this.categoriesList = true; this.categoriesListIcon = 'remove'; }
    else { this.categoriesList = false; this.categoriesListIcon = 'add'; }
  }
  showHideShopList() {
    if (this.shopList == false) { this.shopList = true; this.shopListIcon = 'remove'; }
    else { this.shopList = false; this.shopListIcon = 'add'; }
  }
  ionViewWillEnter() {

    console.log("ionViewCanEnter");
  }
  rateUs() {
    this.loading.autoHide(2000);
    if (this.plt.is('ios')) {
      this.iab.create(this.config.packgeName.toString(), "_system");
    } else if (this.plt.is('android')) {
      this.appVersion.getPackageName().then((val) => {
        this.iab.create("https://play.google.com/store/apps/details?id=" + val, "_system");
      });
    }
  }
  share() {
    this.loading.autoHide(2000);
    if (this.plt.is('ios')) {
      this.socialSharing.share(
        this.config.packgeName.toString(),
        this.config.appName,
        this.config.packgeName.toString(),
        this.config.packgeName.toString()
      ).then(() => {
      }).catch(() => {

      });
    } else if (this.plt.is('android')) {

      this.appVersion.getPackageName().then((val) => {
        this.socialSharing.share(
          this.config.appName,
          this.config.appName,
          "",
          "https://play.google.com/store/apps/details?id=" + val
        ).then(() => {

        }).catch(() => {
        });
      });
    }
  }
  openLanguagePage() {
    let modal = this.modalCtrl.create(LanguagePage);// <!-- 2.0 updates -->
    modal.present();
  }
}
