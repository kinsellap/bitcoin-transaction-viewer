const Messages = require('bitcore-p2p').Messages;
const Pool = require('bitcore-p2p').Pool;
const Networks = require('bitcore-lib').Networks;
const satoshiConverter = require("satoshi-bitcoin");
const btcDiff = require('bitcoin-diff')
const formatDateTime = require("./date-time-utils").formatDateTime;
var pool = new Pool({
  network: Networks.livenet,
  maxSize: 1
});

pool.on('peerready', peer => {
  console.log(`${peer.version}, ${peer.subversion}, ${peer.bestHeight}, ${peer.host}`);
});

pool.on('peerinv', (peer, message) => {
  message.inventory.forEach(i => {
    var messageData;
    if (i.type === 1) {
      messageData = new Messages().GetData.forTransaction(i.hash);
    } else if (i.type === 2) {
      messageData = new Messages().GetData.forBlock(i.hash);
    }
    peer.sendMessage(messageData);
  });
});

pool.on('peerblock', (peer, message) => {
  const { block } = message;
  const { header } = block;
  console.log(`Block transaction: ${peer.version}, ${peer.subversion}, ${peer.bestHeight}, ${peer.host} `);
  const dateAdded = formatDateTime(header.time);
  // const difficulty = btcDiff(header.bits);
  console.log(`Date added       : ${dateAdded}`);
  console.log(`Hash             : ${header.hash}`);
  console.log(`Nonce            : ${header.nonce}`);
  // console.log(`Difficulty: ${difficulty}`);
  console.log(`Transaction count: ${block.transactions.length}`);
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

pool.on('peerdisconnect', (peer) => {
  console.log(`Peer ${peer.host} disconnected`);
});

pool.on('disconnect', () => {
  console.log('connection closed');
});
pool.connect();
