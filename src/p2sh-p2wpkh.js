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
        operationId: 'aaa',
        outputs: [
            {
                amount: 16000,
                address: 'REfaLe5mDYxrRo9R54d6Cd8YtS7SgpGE8f'
            }
        ],
        unspents: [
            {
                amount: 20000,
                id: '06812d31ae80732ae214932fc2352ad29f69d2ef3a4e5be59fbb1504a03addef',
                idx: 1,
                scriptHex: 'a9143b145cc7e5ec0b3256f0994f0ee34f307717231b87',
                isScript: true,
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
    const signedTransaction = await h.sign(withdraw)
    console.log(signedTransaction);
    try {
        const res = await publishTransaction(signedTransaction)
        console.log(res);
        console.log('AAAAAAAAAAA');
    }catch(e) {
        console.error(e.response);
        console.log('ZZZZZZZ');
    }
    
}
//const signedTransaction = transactionHelper.sign(withdraw, true)
test(transactionHelper)


//console.log(signedTransaction);