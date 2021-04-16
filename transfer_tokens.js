
var data = require("./read_file.js");
var address_arr = data.address_arr
var tokensToDistribute = data.tokensToDistribute
const Web3 = require('web3')
var Tx = require('ethereumjs-tx').Transaction

const web3 = new Web3('https://ropsten.infura.io/v3/5be82dca3e524b3cb039378a08c16fb3') // Your Infura Endpoint here 

// use your owner_account and account2 from metamask here!
const owner_account = '0x5624Ca0d2Ef4759bf4043b1Be51966b0Ca218e41' // Your account address 1
// put in your private keys here (from metamask)
const privateKey1 = Buffer.from('25be1ed4a98c5b0e9fbf0df0bd9b790b944d227c35cce0b1d69d8eae02dd0360', 'hex')

// Read the deployed contract - get the addresss from Etherscan 
// - use your deployed contract address here!
const contractAddress = '0x632e311e9df4e91b72c4bf46c19bfff73d09814c'

const contractABI = data.abi// YOUR CONTRACT ABI HERE

const contract = new web3.eth.Contract(contractABI, contractAddress)


const getTransactionCount = async(account) => {
  return await web3.eth.getTransactionCount(account)
}

const sendTransaction = async(raw) => {
  return await web3.eth.sendSignedTransaction(raw)
}

var transferFunds = async(owner_account, receiver_account, tokensToDistribute) => {

  let txCount = await getTransactionCount(owner_account)

  console.log("Transactions count returned: " + txCount)
  const txObject = {
    nonce:    web3.utils.toHex(txCount),
    gasLimit: web3.utils.toHex(600000), // uses about 36,000 gas so add some buffer
    gasPrice: web3.utils.toHex(web3.utils.toWei('30', 'gwei')),
    to: contractAddress,
    data: contract.methods.transfer(receiver_account, tokensToDistribute).encodeABI()
  }

  const tx = new Tx(txObject, {chain:'ropsten', hardfork: 'petersburg'})

  tx.sign(privateKey1)

  const serializedTx = tx.serialize()
  const raw = '0x' + serializedTx.toString('hex')

  //console.log("Raw hex transaction: " + raw)

  console.log("About to send transaction.....")

  let minedTransaction = await Promise.resolve(sendTransaction(raw));
  console.log("Transaction hash returned: " + minedTransaction.transactionHash)
  console.log("Tokens are received at: " + receiver_account + "\n")
  return `txHash is: ${minedTransaction.transactionHash}`
}

// async methods
const getBalanceOf = async(account) => {
  let balanceOf = await contract.methods.balanceOf(account).call()
  return `balance of account ${account} is ${balanceOf}`
}

var go = async(receiver_account) => {
    var totSupply = await contract.methods.totalSupply().call();
    totSupply = new BigDecimal(totSupply);
    totSupply = totSupply.divide(100);
    totSupply = totSupply.multiply(5);
    if (receiver_account == address_arr[0]){
      console.log("5% of owner balance is: " + totSupply.toString().split(".")[0])
    }
    totSupply = totSupply.divide(address_arr.length);
    totSupply = totSupply.toString().split(".")[0]
    //module.exports.totalTokensPerAddress  = totSupply
    if (receiver_account == address_arr[0]){
      console.log("Total tokens to distribute per address: " + totSupply)
    }
    await transferFunds(owner_account, receiver_account, totSupply)
  }

const delay = (receiver_account) => {
return new Promise((resolve) => {
    setTimeout(() => {
      resolve(go(receiver_account));
    }, 7000);
  });
}
const startTime = Date.now();
const doNextPromise = (d) => {
  delay(address_arr[d])
    .then(x => {
      d++;
      if (d < address_arr.length){
        doNextPromise(d)
      }
})
}
doNextPromise(0);


class BigDecimal {
    static DECIMALS = 18; // number of decimals on all instances
    static ROUNDED = true; // numbers are truncated (false) or rounded (true)
    static SHIFT = BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
    constructor(value) {
        if (value instanceof BigDecimal) return value;
        let [ints, decis] = String(value).split(".").concat("");
        this._n = BigInt(ints + decis.padEnd(BigDecimal.DECIMALS, "0")
                                     .slice(0, BigDecimal.DECIMALS)) 
                  + BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5");
    }
    static fromBigInt(bigint) {
        return Object.assign(Object.create(BigDecimal.prototype), { _n: bigint });
    }
    add(num) {
        return BigDecimal.fromBigInt(this._n + new BigDecimal(num)._n);
    }
    subtract(num) {
        return BigDecimal.fromBigInt(this._n - new BigDecimal(num)._n);
    }
    static _divRound(dividend, divisor) {
        return BigDecimal.fromBigInt(dividend / divisor 
            + (BigDecimal.ROUNDED ? dividend  * 2n / divisor % 2n : 0n));
    }
    multiply(num) {
        return BigDecimal._divRound(this._n * new BigDecimal(num)._n, BigDecimal.SHIFT);
    }
    divide(num) {
        return BigDecimal._divRound(this._n * BigDecimal.SHIFT, new BigDecimal(num)._n);
    }
    toString() {
        const s = this._n.toString().padStart(BigDecimal.DECIMALS+1, "0");
        return s.slice(0, -BigDecimal.DECIMALS) + "." + s.slice(-BigDecimal.DECIMALS)
                .replace(/\.?0+$/, "");
    }
}