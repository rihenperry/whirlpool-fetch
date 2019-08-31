import logger from './helpers/applogging';
import util from 'util';

const log = logger(module);

export let fetcherPublish = (channel,
                             data={},
                             routingKey='fetcher_p.to.parser_c',
                             exchangeName='urlfrontier.ex.fetcher') => {
                               return new Promise((resolve, reject) => {
                                 let senderData = (Object.entries(data).length === 0 &&
                                                   data.constructor === Object)?
                                     JSON.stringify({
                                       url: "http://dice.com/something",
                                       doc_id: "mongodb_doc_id",
                                       type: "c_or_nc",
                                       domain: "http://dice.com.com/"
                                     }): JSON.stringify(data);

                                 channel.publish(exchangeName,
                                                 routingKey,
                                                 Buffer.from(senderData, 'utf-8'),
                                                 {persistent: true, headers: {type: "application/json"}},
                                                 (err, ok) => {
                                                   if (err) {
                                                     log.error('publish malformed ', err);
                                                     return reject(err);
                                                   } else {
                                                     log.info('publish messaged acknowledged', ok);
                                                     resolve(true);
                                                   }
                                                 });
                               });
                             }
