import { getConfig } from '../config.js';
import fetch from 'node-fetch';
import type { AddressMempoolObject } from 'sbtc-bridge-lib';
import { checkAddressForNetwork  } from 'sbtc-bridge-lib' 

export async function fetchBitcoinTipHeight() {
  try {
    const url = getConfig().mempoolUrl + '/blocks/tip/height';
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchTransactionHex(txid:string) {
  try {
    //https://api.blockcypher.com/v1/btc/test3/txs/<txID here>?includeHex=true
    //https://mempool.space/api/tx/15e10745f15593a899cef391191bdd3d7c12412cc4696b7bcb669d0feadc8521/hex
    const url = getConfig().mempoolUrl + '/tx/' + txid + '/hex';
    const response = await fetch(url);
    const hex = await response.text();
    return hex;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchTransaction(txid:string) {
  try {
    const url = getConfig().mempoolUrl + '/tx/' + txid;
    const response = await fetch(url);
    if (response.status !== 200) throw new Error('Unable to fetch transaction for: ' + txid);
    const tx = await response.json();
    return tx;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function fetchAddress(address:string):Promise<AddressMempoolObject> {
  const url = getConfig().mempoolUrl + '/address/' + address;
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchAddressTransactions(address:string, lastId?:string) {
  let url = getConfig().mempoolUrl + '/address/' + address + '/txs';
  if (lastId) url += '/' + lastId
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchUtxosForAddress(address:string) {
  let url = getConfig().electrumUrl + '/address/' + address + '/utxo';
  console.log('fetchUtxoSetDevnet: fetchUtxosForAddress' + url);
  const response = await fetch(url);
  const result = await response.json();
  return result;
}

export async function fetchUTXOs(address:string) {
  try {
    // this will work on test/main net but not devnet
    const url = getConfig().mempoolUrl + '/address/' + address + '/utxo';
    const response = await fetch(url);
    //if (response.status !== 200) throw new Error('Unable to retrieve utxo set from mempool?');
    const result = await response.json();
    return result;
  } catch(err) {
    console.log(err)
    return;
  }
}

export async function readTx(txid:string) {
  const url = getConfig().mempoolUrl + '/tx/' + txid;
  const response = await fetch(url);
  const result = await response.json();
  let error = '';
  try {
    return (result.vout);
  } catch (err:any) {
    error = err.message;
  }
  throw new Error(error);
}

export async function sendRawTxDirectMempool(hex:string) {
  const url = getConfig().mempoolUrl + '/tx';
  console.log('sendRawTxDirectMempool: ', url)
  const response = await fetch(url, {
    method: 'POST',
    //headers: { 'Content-Type': 'application/json' },
    body: hex
  });
  let result:any;
  if (response.status !== 200) throw new Error('Mempool error: ' + response.status + ' : ' + response.statusText);
  try {
    result = await response.json();
  } catch (err) {
    result = await response.text();
  }
  return result;
}
