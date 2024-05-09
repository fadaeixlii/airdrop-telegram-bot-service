import tonCore from "@ton/crypto";
import ton from "@ton/ton";

export class createWallet {
  protected client = new ton.TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: "c0591dd9646e08af79712cb58a3ee34a842835f3e174eea22f194946205c5ad8",
  });

  // mongodb id
  public async createNewWallet(userId: string) {
    let password = generateStrongPassword(8, userId);
    let mnemonic = await tonCore.mnemonicNew(12, password);
    let keyPair = await tonCore.mnemonicToPrivateKey(mnemonic, password);
    let wallet = ton.WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    return {
      mnemonic: mnemonic.toString(),
      password: password.toString(),
      address: wallet.address.toString(),
    };
  }

  public async getBalance(mne: string[], pass: string) {
    let keyPair = await tonCore.mnemonicToPrivateKey(mne, pass);
    let contract = ton.WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    let wallet = this.client.open(contract);
    return ton.fromNano(await wallet.getBalance());
  }

  public async getTransactionUserIncome(
    lastHashTL: string,
    mne: string[],
    pass: string
  ) {
    let keyPair = await tonCore.mnemonicToPrivateKey(mne, pass);
    let contract = ton.WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    let wallet = this.client.open(contract);
    let infoWallet = await this.client.getContractState(wallet.address);

    const opts = {
      limit: 100,
      lt: infoWallet.lastTransaction?.lt, //جدیترین تاریخ
      to_lt: lastHashTL, //تا  تراکنش ثبت شده
    };
    let transaction = await this.client.getTransactions(wallet.address, opts);
    const resultTransaction: {
      hash: any;
      lt: any;
      amount: string;
      message: string;
    }[] = [];

    transaction.forEach((itData: any) => {
      if (
        itData.inMessage?.info.value !== undefined &&
        itData.inMessage.body !== undefined
      ) {
        const hexString = itData.inMessage.body.toString();
        const hexWithoutPrefix = hexString
          .substring(3, hexString.length - 1)
          .replace(/^0+/, "");
        const modelIncomeTransaction = {
          hash: itData.hash().toString("base64"),
          lt: itData.lt.toString(),
          amount: ton.fromNano(itData.inMessage.info.value.coins),
          message: convertUTF8(hexWithoutPrefix),
        };
        resultTransaction.push(modelIncomeTransaction);
      }
    });
    return resultTransaction;
  }

  public async getTransactionUserOutcome(
    lastHashTL: string,
    mne: string[],
    pass: string
  ) {
    let keyPair = await tonCore.mnemonicToPrivateKey(mne, pass);
    let contract = ton.WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });
    let wallet = this.client.open(contract);
    let infoWallet = await this.client.getContractState(wallet.address);

    const opts = {
      limit: 100,
      lt: infoWallet.lastTransaction?.lt, //جدیترین تاریخ
      to_lt: lastHashTL, //تا  تراکنش ثبت شده
    };
    let transaction = await this.client.getTransactions(wallet.address, opts);
    const resultTransaction: {
      hash: any;
      lt: any;
      amount: string;
      message: string;
    }[] = [];

    transaction.forEach((itData: any) => {
      if (
        itData.outMessages.values() !== undefined &&
        itData.outMessages.length != 0 &&
        itData.outMessages.get(0).info.value.coins.valueOf() > 0
      ) {
        const hexString = itData.outMessages.get(0).body.toString();
        const hexWithoutPrefix = hexString
          .substring(3, hexString.length - 1)
          .replace(/^0+/, "");
        const modelOutcomeTransaction = {
          hash: itData.hash().toString("base64"),
          lt: itData.lt.toString(),
          amount: ton.fromNano(itData.outMessages.get(0).info.value.coins),
          message: convertUTF8(hexWithoutPrefix),
        };
        resultTransaction.push(modelOutcomeTransaction);
      }
    });
    return resultTransaction;
  }
}

function generateStrongPassword(length: number, str: string) {
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * str.length);
    password += str.charAt(randomIndex);
  }
  return password;
}
function convertUTF8(str: string) {
  return Buffer.from(str, "hex").toString("utf8");
}
