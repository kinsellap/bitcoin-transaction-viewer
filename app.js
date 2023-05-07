const Messages = require('bitcore-p2p').Messages;
const Pool = require('bitcore-p2p').Pool;
const Networks = require('bitcore-lib').Networks;
const satoshiConverter = require("satoshi-bitcoin");
const btcDiff = require('bitcoin-diff')
const formatDateTime = require("./date-time-utils");
var pool = new Pool({
  network: Networks.livenet,
  maxSize: 10000
});

pool.on('peerready', peer => {
  console.log(`${peer.version}, ${peer.subversion}, ${peer.bestHeight}, ${peer.host}, ${peer.status}`);
});

pool.on('peerinv', (peer, message) => {
  message.inventory.forEach(i => {
    var messageData;
    if (i.type === 1) {
      messageData = new Messages().GetData.forTransaction(i.hash);
    } else if (i.type === 2) {
      console.log("BLOCK");
      messageData = new Messages().GetData.forBlock(i.hash);
    }
    peer.sendMessage(messageData);
  });
});

pool.on('peerblock', (peer, message) => {
  const { block } = message;
  const { header } = block;
  console.log(`Block transaction received from ${peer.host} `);
  const dateAdded = formatDateTime(header.time);
  // const difficulty = btcDiff(header.bits);
  console.log(`Date added: ${dateAdded}`);
  console.log(`Hash: ${header.hash}`);
  console.log(`Nonce: ${header.nonce}`);
  // console.log(`Difficulty: ${difficulty}`);
  console.log(`# Transactions: ${block.transactions.length}`);
  const txMap = new Map();
  var totalValue = 0;
  block.transactions.forEach(tx => {
    const txValue = satoshiConverter.toBitcoin(tx.outputs.map(tx => tx.satoshis).reduce((prev, curr)=> prev+curr,0));
    txMap.set(tx.hash,txValue);
    totalValue += txValue;
  })

  console.log(`Total block vlaue: ${totalValue}`);
  const [firstKey] = txMap.keys();
  console.log(firstKey); 

  const [firstValue] = txMap.values();
  console.log(firstValue)
});

pool.on('peerdisconnect', (peer, tx) => {
  console.log(`Peer ${peer.host} disconnected`)
});


pool.on('disconnect', () => {
  console.log('connection closed');
});

pool.connect();

//   async connect() {
//   this.setupListeners();
//   this.pool.connect();
//   this.connectInterval = setInterval(this.pool.connect.bind(this.pool), 5000);
//   return new Promise < void> (resolve => {
//     this.pool.once('peerready', () => resolve());
//   });
// }

//   async disconnect() {
//   this.pool.removeAllListeners();
//   this.pool.disconnect();
//   if (this.connectInterval) {
//     clearInterval(this.connectInterval);
//   }
