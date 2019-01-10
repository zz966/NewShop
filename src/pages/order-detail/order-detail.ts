// Project Name: IonicEcommerce
// Project URI: http://ionicecommerce.com
// Author: VectorCoder Team
// Author URI: http://vectorcoder.com/
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ConfigProvider } from '../../providers/config/config';
import { AlertProvider } from '../../providers/alert/alert';
import { LoadingProvider } from '../../providers/loading/loading';
import { SharedDataProvider } from '../../providers/shared-data/shared-data';
import { Http } from '@angular/http';
import { ProductDetailPage } from '../product-detail/product-detail';


@Component({
  selector: 'page-order-detail',
  templateUrl: 'order-detail.html',
})
export class OrderDetailPage {
  order: { [k: string]: any } = {};;
  constructor(
    public navCtrl: NavController,
    public config: ConfigProvider,
    public navParams: NavParams,
    public http: Http,
    public shared: SharedDataProvider,
    public alert: AlertProvider,
    public loading: LoadingProvider) {
    this.order = this.navParams.get('data');


    //console.log(this.order);
  }
  getSingleProductDetail(id) {
    this.loading.show();
    this.config.Woocommerce.getAsync("products/" + id + "?" + this.config.productsArguments).then((data) => {
      this.loading.hide();
      this.navCtrl.push(ProductDetailPage, { data: JSON.parse(data.body) });
    }, err => {
      this.loading.hide();
      this.alert.show("Item not Available!");
      console.log(err);
    });

    this.shared.addToRecent(id);
  }
  cancelOrder() {


    let orderCreateDate = new Date(this.order.date_created);
    let orderSeconds = orderCreateDate.getTime() / 1000;
    let timeknow = new Date();
    let currentTime = timeknow.getTime() / 1000;

    let timeToCancelOrder = this.config.cancelOrderTime * 3600;
    let timeDiff = (currentTime - orderSeconds)
    //console.log(timeDiff + " " + timeToCancelOrder);
    console.log(timeToCancelOrder - timeDiff);
    let result = timeToCancelOrder - timeDiff;

    if (result < 0) this.shared.toast("Order Cancelation Time Expires!");
    else {

      this.loading.show();
      let dat = {
        status: 'cancelled'
      };
      this.config.Woocommerce.putAsync("orders/" + this.order.id, dat).then((data) => {
        this.loading.hide();
        this.navCtrl.pop();
        this.shared.toast("Order Cancelled");
      }, err => {
        this.loading.hide();
        this.shared.toast("Server Error");
        console.log(err);
      });

    }
  }
  ionViewDidLoad() {
    this.order = this.navParams.get('data');
  }

}
