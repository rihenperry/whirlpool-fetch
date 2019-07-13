import logger from './helpers/applogging';

export let fetcherPublish = (channel,
                             data=null,
                             routingKey='fetcher_p.to.parser_c',
                             exchangeName='urlfrontier.ex.fetcher') => {
                               return new Promise((resolve, reject) => {
                                 let senderData = data === null? JSON.stringify({
                                   advice: "sent by whirlpool fetch publisher"
                                 }): data;

                                 channel.publish(exchangeName,
                                                 routingKey,
                                                 Buffer.from(JSON.stringify(senderData), 'utf-8'),
                                                 {persistent: true},
                                                 (err, ok) => {
                                                   if (err) {
                                                     logger.log('error', 'publish malformed ', err);
                                                     return reject(err);
                                                   } else {
                                                     logger.log('info', 'publish messaged acknowledged',
                                                                ok);
                                                     resolve(true);
                                                   }
                                                 });
                               });
                             }
