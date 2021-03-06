import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
import { TransactionDetailPage } from '../transaction-detail/transaction-detail';
import { User } from '../../models/user';
import { SuperadminPage } from '../superadmin/superadmin';
/**
 * Generated class for the AllTransactionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-all-transactions',
  templateUrl: 'all-transactions.html',
})
export class AllTransactionsPage {
  public completedTransactions: any;
  public user = {} as User;
  public transaction = {
    date: [],
    amount: [],
    state:[],
    senderAvatar: [],
    senderName: [],
    receiverAvatar:[],
    receiverName:[],
    receiverCashoutMethod:[],
    receiverStreetAddress1:[],
    receiverStreetAddress2:[],
    receiverCity:[],
    receiverState:[],
    receiverZipCode:[],
    receiverPaypalEmail:[],
    receiverPaypalPassword:[],
    receiverBankAccountName:[],
    receiverBankName:[],
    receiverBankAccountNumber:[],
    receiverBankRouting:[]
  };
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public afd: AngularFireDatabase,
    public firebaseProvider: FirebaseProvider,
  ) {
    this.user = navParams.get("user");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AllTransactionsPage');
    var that = this;
    that.completedTransactions = [];
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var transaction = {
          date: [],
          amount: [],
          state: [],
          senderAvatar: [],
          senderName: [],
          receiverAvatar: [],
          receiverName: [],
          receiverCashoutMethod: [],
          receiverStreetAddress1: [],
          receiverStreetAddress2: [],
          receiverCity: [],
          receiverState: [],
          receiverZipCode: [],
          receiverPaypalEmail: [],
          receiverPaypalPassword: [],
          receiverBankAccountName: [],
          receiverBankName: [],
          receiverBankAccountNumber: [],
          receiverBankRouting: [],
          receiverBankRoutingNumber: [],
        }

        var senderid = childSnapshot.val().senderid;
        var receiverid = childSnapshot.val().receiverid;
        var state = childSnapshot.val().state;
        if(state == 1){
          var query = firebase.database().ref("users").orderByKey();
          query.once("value").then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
              if (childSnapshot.val().id == senderid) {
                transaction.senderAvatar.push(childSnapshot.val().avatar);
                transaction.senderName.push(childSnapshot.val().fullName);
              }
              if (childSnapshot.val().id == receiverid) {
                transaction.receiverAvatar.push(childSnapshot.val().avatar);
                transaction.receiverName.push(childSnapshot.val().fullName);
                transaction.receiverCashoutMethod.push(childSnapshot.val().cashoutMethod);
                transaction.receiverStreetAddress1.push(childSnapshot.val().streetAddress1);
                transaction.receiverStreetAddress2.push(childSnapshot.val().streetAddress2);
                transaction.receiverCity.push(childSnapshot.val().city);
                transaction.receiverState.push(childSnapshot.val().state);
                transaction.receiverZipCode.push(childSnapshot.val().zipCode);
                transaction.receiverPaypalEmail.push(childSnapshot.val().paypalEmail);
                transaction.receiverPaypalPassword.push(childSnapshot.val().paypalPassword);
                transaction.receiverBankAccountName.push(childSnapshot.val().bankAccountName);
                transaction.receiverBankName.push(childSnapshot.val().bankName);
                transaction.receiverBankAccountNumber.push(childSnapshot.val().bankAccountNumber);
                transaction.receiverBankRouting.push(childSnapshot.val().bankRouting);
                transaction.receiverBankRoutingNumber.push(childSnapshot.val().bankRoutingNumber);
              }
            });
          });
          transaction.date.push(childSnapshot.val().transactionid);
          transaction.amount.push(childSnapshot.val().sendmoney);
          transaction.state.push(childSnapshot.val().state);
          that.completedTransactions.unshift(transaction);
        }
      });
    });
  }
  showDetailTransaction(transactionid){
    for (let transaction of this.completedTransactions) {
      if(transaction.date == transactionid){
        this.navCtrl.push(TransactionDetailPage, {
          transaction: transaction,
          user:this.user
        });

      }
    }
  }
  deleteTransaction(id){
    var that = this;
    var query = firebase.database().ref("transactions").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val().transactionid == id) {
          childSnapshot.ref.remove();
          that.navCtrl.push(SuperadminPage, {
            user: that.user
          });
        }
      });
    });
  }

}
