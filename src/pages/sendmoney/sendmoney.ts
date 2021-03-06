import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from '../../models/user';
import { sendmoneyData } from '../../models/sendmoneyData';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { Http } from '@angular/http';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
import { ReportPage } from '../report/report';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SenderPage } from '../sender/sender';
import { Storage } from '@ionic/storage';
import { CurrencyPipe } from '@angular/common';
import { LoginPage } from '../login/login';
import { SimpleMaskMoney } from 'simple-mask-money'; // import mask
import { OnInit, AfterViewInit } from '@angular/core';

@IonicPage()
@Component({
  selector: "page-sendmoney",
  templateUrl: "sendmoney.html"
})
export class SendmoneyPage {
  scannedCode = null;
  findQRcode = 0;
  qrType = null;
  public qrId = null;
  public findtransaction = false;
  public sendmoneyData = {} as sendmoneyData;
  public sendmethodtext: any;
  public toastText: string;
  public box_price_formatted: string;
  public receivemethodtext: any;
  public receivers: any;
  public sender = {} as User;
  public receiver = {} as User;
  public transactiondata = {} as sendmoneyData;
  public receiverAvatar: any;
  public val = "$";
  public sendmoneyformatedcurrency: any;
  public groupReceivers: Array<{
    fullName: any;
    qrId: any;
  }>;
  constructor(
    private currencyPipe: CurrencyPipe,
    public toastCtrl: ToastController,
    public http: Http,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private payPal: PayPal,
    private storage: Storage,
    private barcodeScanner: BarcodeScanner
  ) {
    this.http = http;
    this.sender = navParams.get("user");
  }

  ionViewDidLoad() {
    const options = { prefix: "$", suffix: "", fixed: true, fractionDigits: 2, decimalSeparator: ".", thousandsSeparator: ",", autoCompleteDecimal: false };

    SimpleMaskMoney.setMask("#myInput", options);

    this.sendmoneyData.senderid = this.sender.id;
    this.groupReceivers = [];
    this.scanCode();
    // this.findReceiver(1516170323270);

  }
  sendmoneyinit(){
    this.sendmoneyData.sendmoney = 0;

    this.val = "$" + 0 + ".00";
    // this.val = "";
  }
  send(e) {
    console.log(JSON.stringify(SimpleMaskMoney.format(this.val)));
    console.log(JSON.stringify(SimpleMaskMoney.formatToNumber(this.val)));
    this.sendmoneyData.sendmoney = SimpleMaskMoney.formatToNumber(this.val);
    var c = this.val;
    this.val = SimpleMaskMoney.formatToNumber(c);

    if (e.key !== "Enter") return;
  }

  sendmoneySelect(money) {
    this.sendmoneyData.sendmoney = money;
    this.val = "$" + money + ".00";
  }
  sendMoney(sendmoneyData) {
    if (
      this.sendmoneyData.sendmoney == 0 ||
      this.sendmoneyData.sendmoney == null
    ) {
      this.showAlert("You forgot to enter a tip!");
    } else {
      var now = new Date();
      sendmoneyData.transactionid = now.getTime();
      this.storage.set("transaction", 1);

      this.payPal
        .init({
          PayPalEnvironmentProduction:
            "AbY-fpk5uCigup92d7V8YeDwjWUYbgEWDquKksC4aRUmYVp1mZ3Oi219sLi5bHVnm3TdQZGvUdiBTn74",
          PayPalEnvironmentSandbox:
            "Abacm9KbTQnhqyNP9gBI8cDxpgPeTm24MR_Gq3zwpEgyefHLIM1seUkRfQmSqMsynd2SgaovIuFBVL4t"
        })
        .then(
          () => {
            // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
            this.payPal
              .prepareToRender("PayPalEnvironmentProduction", new PayPalConfiguration(
                  {
                    // Only needed if you get an "Internal Service Error" after PayPal login!
                    //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
                    acceptCreditCards: false
                  }
                ))
              .then(() => {
                  let payment = new PayPalPayment(sendmoneyData.sendmoney.toString(), "USD", "Description", "sale");
                  // payment.payeeEmail = this.sendmoneyData.receiverpaypalemail;
                  this.payPal
                    .renderSinglePaymentUI(payment)
                    .then(
                      () => {
                        this.afd
                          .list("/transactions/")
                          .push(sendmoneyData);
                        this.showAlertSuccess(
                          "Transaction completed!"
                        );

                        this.storage.remove("transaction");
                        this.storage
                          .get("currentUser")
                          .then(val => {
                            this.navCtrl.push(SenderPage, {
                              user: val
                            });
                          });
                      },
                      () => {
                        // Error or render dialog closed without being successful
                      }
                    );
                }, () => {
                  // Error in configuration
                });
          },
          () => {
            // Error in initialization, maybe PayPal isn't supported or something else
          }
        );
    }
  }
  scanCode() {
    this.barcodeScanner.scan().then(
      barcodeData => {
        this.qrId = atob(barcodeData.text);
        if (this.qrId == "") {
          this.gotoHome();
        } else {
          var that = this;
          var query = firebase
            .database()
            .ref("qrdatas")
            .orderByKey();
          query.once("value").then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
              if (childSnapshot.val().id == that.qrId) {
                that.findQRcode = 1;
                if (childSnapshot.val().type == 0) {
                  that.findReceiver(that.qrId);
                } else {
                  that.qrType = 1;
                  that.findGroupReceivers(that.qrId);
                }
              }
            });
            if (that.findQRcode == 0) {
              that.showAlert("QR code invalid!");
              that.navCtrl.push(SenderPage, {
                user: that.sender
              });
            }
          });
        }
      },
      err => {
        this.navCtrl.push(SenderPage, {
          user: this.sender
        });
      }
    );
  }

  findReceiver(qrnumber) {
    var that = this;
    var query = firebase
      .database()
      .ref("users")
      .orderByKey();

    query.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().qrId == qrnumber) {
          // if (childSnapshot.val().cashoutMethod == 0) {
          //   that.showAlert("Sorry, Receiver cashout method did not set");
          //   that.gotoHome();
          // }

          that.sendmoneyData.receiverid = childSnapshot.val().id;
          that.sendmoneyData.receivername = childSnapshot.val().fullName;
          that.receiverAvatar = childSnapshot.val().avatar;
          that.sendmoneyData.sendername = that.sender.fullName;
          that.sendmoneyData.state = 0;
          if (that.sender.id == that.sendmoneyData.receiverid) {
            that.showAlert("Sorry, You can't pay yourself");
            that.gotoHome();
          }
        }
      });
    });

    if (that.sendmoneyData.receiverid) {
      that.showAlert("This QR code didn't verified!");
      that.gotoHome();
    }
  }
  paytoReceiver(qrnumber) {
    var that = this;
    var query = firebase
      .database()
      .ref("users")
      .orderByKey();

    query.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().qrId == Number(qrnumber)) {
          that.sendmoneyData.receiverid = childSnapshot.val().id;
          that.sendmoneyData.receivername = childSnapshot.val().fullName;
          that.receiverAvatar = childSnapshot.val().avatar();
          that.sendmoneyData.sendername = that.sender.fullName;
        }
      });
    });
    this.sendMoney(this.sendmoneyData);
  }
  findGroupReceivers(qrnumber) {
    var that = this;
    var query = firebase
      .database()
      .ref("users")
      .orderByKey();

    query.once("value").then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().groupId == qrnumber) {
          if (childSnapshot.val().id != that.sender.id) {
            that.groupReceivers.push({
              fullName: childSnapshot.val().fullName,
              qrId: childSnapshot.val().qrId
            });
          }
        }
      });
    });
  }
  selectReceiver(groupReceivers: any) {
    let alert = this.alertCtrl.create();

    for (let key in this.groupReceivers) {
      let receiver = this.groupReceivers[key];
      alert.addInput({
        type: "radio",
        label: receiver.fullName,
        value: receiver.qrId,
        checked: false
      });
    }
    alert.setTitle("Select Group Receiver");
    alert.addButton("Cancel");
    alert.addButton({
      text: "OK",
      handler: data => {
        this.findReceiver(data);
      }
    });
    alert.present();
  }
  goTransaction(receiver) {}

  showAlert(text) {
    let alert = this.alertCtrl.create({
      title: "Oops!",
      subTitle: text,
      buttons: [
        {
          text: "OK"
        }
      ]
    });
    alert.present();
  }
  showAlertSuccess(text) {
    let alert = this.alertCtrl.create({
      title: "Success!",
      subTitle: text,
      buttons: [
        {
          text: "OK"
        }
      ]
    });
    alert.present();
  }
  presentToast(text) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: "top"
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
  }
  gotoHome() {
    this.navCtrl.push(SenderPage, {
      user: this.sender
    });
  }
}
