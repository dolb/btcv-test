import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'

const app = express()
const port = 3000
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('PONG')
})

async function getInputData(
  unspent,
) {
  return {
    hash: unspent.id,
    index: unspent.idx,
    script: Buffer.from(unspent.scriptHex, 'hex'),
  };
}

const btcvjs = require('./btcvjs-lib')
const sendRestTo = 'royale1qfqqau0hw2dnps5kdx0lf6kuyg60wyl6uy0yfme'

const processTest = async (req, res) => {
  const { data, sendTo, amount } = req.body
  const netParams = btcvjs.alt_networks.bitcoinvault
  try {
    var txb = new btcvjs.Psbt({network: netParams});
    const { balance, fee, unspents } = data;
    const whatIsLeft = balance - fee - amount;
    unspents.forEach(el => {
      const input = getInputData(el)
      console.log(input);
      txb.addInput(input);
    })
    txb.addOutput({address: sendTo, value: amount});
    txb.addOutput({address: sendRestTo, value: whatIsLeft});
    unspents.forEach((el, i) => {
      txb.signInput(i, btcvjs.ECPair.fromWIF(el.wif , netParams));
    })
    const body = txb.build(1).toHex();
    res.json({result: 'ok', body });
  } catch(e) {
    console.error(e);
    res.status(502).json(
      {
        code: 9000,
        message: e
      }
    )
  }
  
}


app.post('/test', processTest)
