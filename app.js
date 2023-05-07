const Messages = require('bitcore-p2p').Messages;
const Pool = require('bitcore-p2p').Pool;
const Networks = require('bitcore-lib').Networks;
const SatoshiConverter = require("satoshi-bitcoin");
const BtcDiff = require('bitcoin-diff')
const formatDateTime = require("./date-time-utils").formatDateTime;
const BlessedContrib = require('blessed-contrib');
const Blessed = require('blessed');
var pool = new Pool({
  network: Networks.livenet,
  // maxSize: 1
});

const Screen = Blessed.screen();
const Grid = new BlessedContrib.grid({ rows: 5, cols: 1, screen: Screen });

const connectedPeers = Grid.set(0, 0, 1, 1, BlessedContrib.log, {
  fg: 'blue',
  label: 'Peers'
});

const blocks = Grid.set(1, 0, 1, 1, BlessedContrib.log, {
  fg: 'yellow',
  label: 'Blocks'
});

const transactions = Grid.set(2, 0, 3, 1, BlessedContrib.log, {
  fg: 'green',
  label: 'Block Transactions'
});

pool.on('peerready', peer => {
  connectedPeers.log(`Peer: ${peer.version}, ${peer.subversion}, ${peer.bestHeight}, ${peer.host} Status: ${ peer.status }` );
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
  const dateAdded = formatDateTime(header.time);
  const difficulty = BtcDiff.bitsToDiff(header.bits);
  var totalValue = 0;
  block.transactions.forEach(tx => {
    const txValue = SatoshiConverter.toBitcoin(tx.outputs.map(tx => tx.satoshis).reduce((prev, curr)=> prev+curr,0));
    transactions.log(`Block Hash:${header.hash}, Tx Hash: ${tx.hash}, Tx Value : ${txValue}`);
    totalValue += txValue;
  })
  blocks.log(`Hash:${header.hash},Date added:${dateAdded},Nonce:${header.nonce},Difficulty:${difficulty},TX count:${block.transactions.length},Total value:${totalValue}`);
});

pool.on('peerdisconnect', (peer) => {
  connectedPeers.log(`Peer: ${peer.host} Status: disconnected`);
});

pool.on('disconnect', () => {
   peerblock.log('connection closed, please restart');
});

Screen.key(['escape', 'q', 'C-c'], () => {
  pool.disconnect();
  process.exit(0);
});

pool.connect();
Screen.render();
