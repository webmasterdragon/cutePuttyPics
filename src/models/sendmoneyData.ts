export interface sendmoneyData {
    transactionid:number;
    sendmoney:number;
    sendmethod:number;
    receivemethod:number;
    senderid:number;
    receiverid:number;
    transactiondate:Date;
    state:number;
    // receiverpaypalemail:string;
    // receivercardnumber:string;
    // receivercardexpirydate:Date;
    // receivercardcvv:number;
    // receiverpaypalverifystate:number;
    receivername:string;
    // senderpaypalemail:string;
    // senderpaypalpassword:string;
    // sendercardnumner:number;
    // sendercardexpirydate:Date;
    // sendercardcvv:number;
    // senderpaypalverifystate:number;
    sendername:string;
  }
  