import TransactionHelper from './transactionHelper'
import axios from 'axios'

const config = {
    jsonRpc: {
        url: 'http://127.0.0.1:18332',
        headers: {
            'Authorization': 'Basic dXNlcjpwYXNz',
            'content-type': 'application/json'
        } 
    }
}
const xprv = 'xprv9s21ZrQH143K2tHFe1yiD7vC4EtQwqETSc3chCePr5jqYZXnBsWznpmF2skdNsZ94XdCNnT6UBQMhuwXUo8771xQsC91oVxWr54D4jT5LKE'

const transactionHelper = new TransactionHelper(config, xprv)

const withdraw = {
    data: {
        operationId: 'whateveraaa',
        outputs: [
            {
                amount: 16000,
                address: 'YdbL2qBqVAx8xZLbfGkbCg8v6a3jTWyZB8'
            }
        ],
        unspents: [
            {
                amount: 20000,
                id: 'b4260448d690de21ecc8f9a2cda0e6adc1aaf03eb61ad4b5f84f899add3189af',
                idx: 1,
                scriptHex: '76a9149c14b786c1174dba64bb758a5c2e6eac77d7f93588ac',
                addressBase: '00000000',
                rawTransactionHex: '02000000000101efdd3aa00415bb9fe55b4e3aefd2699fd22a35c22f9314e22a7380ae312d81060100000000fdffffff02204e0000000000001976a9149c14b786c1174dba64bb758a5c2e6eac77d7f93588ac3dc7040000000000160014b79adbb4706db431605259c713e83cbec67ecd8002483045022100e4c1a322d9af06a46aaee746c37e0d705e9535c8175815ad94638941acf2404702201cc98ff9fd180bf890aaabc2b584c1e6e8c3b4d434e59fdbc7065702b0d284ae012102b13c44b27d23cf64e8f215e25111928a27ac1678e01bba66eb1dd6c80c73c91ad8180100',
                isScript: false,
            }
        ]
    }
}


const publishTransaction = async (withdraw) => {
    const { operationId, body } = withdraw
    const {jsonRpc} = config
    const {url, headers} = jsonRpc
    const rpcCall = await axios.post(
        url,
        {
            jsonrpc: '1.0',
            id: (new Date()).getTime().toString(), 
            method: 'sendrawtransaction', 
            params: [
                body.toString()
            ]
        },
        {headers}
    )
    const { transactionId } = rpcCall
    if(rpcCall.hex != null) {
        return {
            result: 'ok',
            operationId,
            transactionId
        }
    }

    return {
        result: 'fail'
    }
}

const test = async (h) => {
    //const address = await transactionHelper.generateP2SH('00000000')
    //console.log(address.redeem.output.toString('hex'));
    const p2pkh = await h.generateP2PKH('00000000')
    console.log(p2pkh.address);
    const signedTransaction = await h.sign(withdraw)
    console.log(signedTransaction);
    /*try {
        const res = await publishTransaction(signedTransaction)
        console.log(res);
        console.log('AAAAAAAAAAA');
    }catch(e) {
        console.error(e.response);
        console.log('ZZZZZZZ');
    }*/
    
}
//const signedTransaction = transactionHelper.sign(withdraw, true)
test(transactionHelper)


//console.log(signedTransaction);