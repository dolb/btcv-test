import * as R from 'ramda'
import * as bip32 from 'bip32'
import * as lib from 'bitcoinjs-lib'

const netParams = {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'royale',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x4e,
    scriptHash: 0x3c,
    wif: 0x80,
  };



export default class TransactionHelper {
    constructor(config, xprv) {
        this._config = config;
        this._xprv = xprv;
        this._mainNode = bip32.fromBase58(this._xprv, netParams)
        console.log('Initialized main transaction');
    }

    prepareNonWitnessUtxo = (unspent) => {
        return Buffer.from(`${unspent.rawTransactionHex}`, 'hex')
    }

    getInputData = async (unspent) => {
        const isScript = !!unspent.isScript

        if(isScript) {
            const p2sh = await this.generateP2SH()
            return {
                hash: unspent.id,
                index: unspent.idx,
                witnessUtxo: {
                    value: unspent.amount,
                    script: Buffer.from(unspent.scriptHex, 'hex'),
                },
                redeemScript: p2sh.redeem.output,
            };
        }

        if(unspent.rawTransactionHex) {
            return {
                hash: unspent.id,
                index: unspent.idx,
                nonWitnessUtxo: this.prepareNonWitnessUtxo(unspent)
            }    
        }
    
        return {
            hash: unspent.id,
            index: unspent.idx,
            witnessUtxo: {
                value: unspent.amount,
                script: Buffer.from(unspent.scriptHex, 'hex'),
            }
        };
    }

    nodeToAddress(hdNode) {
        const { address } = lib.payments.p2wpkh({ pubkey: hdNode.publicKey, network: netParams })
        return address;
    }

    generateP2SH = async () => {
        const path = this.preparePath()
        const node = R.reduce((derrived, p) => derrived = derrived.derive(p), bip32.fromBase58(this._xprv), path)
        const p2wpkh = lib.payments.p2wpkh({ pubkey: node.publicKey, network: netParams })
        return lib.payments.p2sh(
            {
                redeem: p2wpkh
            }
        )
    }

    generateP2PKH = async () => {
        const path = this.preparePath()
        const node = R.reduce((derrived, p) => derrived = derrived.derive(p), bip32.fromBase58(this._xprv), path)
        return lib.payments.p2pkh({ pubkey: node.publicKey, network: netParams })
    }


    generateAddress = async () => {
        const path = this.preparePath()
        const node = R.reduce((derrived, p) => derrived = derrived.derive(p), bip32.fromBase58(this._xprv), path)
        return this.nodeToAddress(node)
    }

    preparePath() {
        return [0,0]
    }

    deriveWif = () => {
        const path = this.preparePath()
        const node = R.reduce((derrived, p) => derrived = derrived.derive(p), bip32.fromBase58(this._xprv), path)
        const derrivedWif = node.toWIF()
        return derrivedWif
    }

    sign = async (withdrawData) => {
        const { data } = withdrawData

        try {
            var txb = new lib.Psbt({network: netParams});
            const { unspents, outputs, operationId } = data;

            for(var i=0; i<unspents.length; i++) {
                const el = unspents[i]
                const input = await this.getInputData(el)
                console.log(input);
                txb.addInput(input)
            }

            outputs.forEach(el => {
                const { address, amount, fee } = el
                txb.addOutput({address, value: (amount - (fee || 0))});
            })

            unspents.forEach((el, i) => {
                const derivedWif = this.deriveWif()
                txb.signInput(i, lib.ECPair.fromWIF(derivedWif , netParams));
            })

            txb.validateSignaturesOfAllInputs() 

            txb.finalizeAllInputs();

            const transaction = txb.extractTransaction()
            const body = transaction.toHex()
            const transactionId = transaction.getId()
            console.log(`Signed ${transactionId}`);
            return {result: 'ok', body, operationId, transactionId };
        } catch(e) {
            console.error(e);
            return {
                result: 'fail',
                code: 9000,
                message: e
            }
        }
    }



}
