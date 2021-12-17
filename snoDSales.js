require('dotenv').config();
const fetch = require('node-fetch');
const Discord = require('discord.js');
var ethers = require('ethers');
let channel ='';
// Create a new client instance
const client = new Discord.Client();

// When the client is ready, run this code (only once)
client.on('ready', () => {
	channel = client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
	client.channels.fetch(process.env.DISCORD_CHANNEL_ID).then((c) => {
        channel = c;
    });
});
 main = async (channel) => {
  const seconds = 3600;
  const hoursAgo = (Math.round(new Date().getTime() / 1000) - (seconds)); // in the last hour, run hourly?
const params = new URLSearchParams({
    offset: '0',
    event_type: 'successful',
    only_opensea: 'false',
    occurred_after: hoursAgo.toString(), 
    collection_slug: process.env.COLLECTION_SLUG,
  })
 let openSeaFetch = {}
  if (process.env.OPENSEA_TOKEN) {
    openSeaFetch['headers'] = {'X-API-KEY': process.env.OPENSEA_TOKEN}
  }
    params.append('asset_contract_address', process.env.CONTRACT_ADDRESS)
const openSeaResponse = await fetch(
    "https://api.opensea.io/api/v1/events?" + params,openSeaFetch).then((resp) => resp.json());
	console.log(openSeaResponse);
   return Promise.all(
    openSeaResponse.asset_events.reverse().map((sale) => {
      const message = buildMessage(sale);
      return channel.send(message)
    })
);
}
const buildMessage = (sale) => (
  new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(sale.asset.name + ' sold!')
	.setURL(sale.asset.permalink)
	.setThumbnail(sale.asset.collection.image_url)
	.addFields(
		{ name: 'Amount', value: `${ethers.utils.formatEther(sale.total_price || '0')}${ethers.constants.EtherSymbol}`},
		{ name: 'Buyer', value: sale.winner_account.address },
		{ name: 'Seller', value: sale.seller.address  }
	)
  .setImage(sale.asset.image_url)
	.setTimestamp(Date.parse(`${sale.created_date}Z`))
	.setFooter('Sold on OpenSea', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png')
);

// Login to Discord with your client's token
setInterval(function(){
   main(channel); 
},3600 * 1000)
client.login(process.env.DISCORD_BOT_TOKEN);

