import {inspect} from 'util';
import {mongoose, model, Types} from 'mongoose';
const request = require('request');
var dnscache = require('dnscache')({
  "enable" : true,
  "ttl" : 300,
  "cachesize" : 1000
});

import logger from './helpers/applogging';
import {fetcherPublish as publish} from './publish';

const log = logger(module);

export let fetcherConsume = async function({rmqConn, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("fetcher.q", async function(msg) {
      let WhirlpoolHTMLPage = model('whirlpoolpage');

      let seed = JSON.parse(msg.content.toString());
      log.info('fetch downloading seed %s', inspect(seed));

      // configure request
      let hrstart = process.hrtime();
      let seedUrl = new URL(seed.url);
      let htmlblob = '';
      const doc_id = new Types.ObjectId();
      const options = {
        method: 'GET',
        uri: seedUrl,
        hostname: seedUrl.hostname,
        path: seedUrl.pathname,
        headers: {
          'User-Agent': 'whirlpool-crawler',
          'email': 'rihanstephen.pereira576@myci.csuci.edu',
          'message': 'performing data collection for pure education/excercise purpose.\
                   I have no intention to sell this data to 3rd party. While doing so,\
                   full complying with robots.txt, outmost care is taken that your\
                   business wont be interrupted. I am complying with robots.txt regulations,\
                   am taking care that'
        },
        lookup: dnscache.lookup(seedUrl.hostname, (e, r) => {
          if (e) {
            log.error('custom dns e %s', inspect(e));
          }

          log.debug('dns entry caching %s, domain %s, metric %d ms',
                    inspect(r),
                    seedUrl.hostname,
                    process.hrtime(hrstart)[1]/1000000);
        })
      };

      /* dns cache */
      /* end of dns cache */
      request(options,
              async (err, res, body) => {
                if (err) {
                  log.error('cannot process url %s, error %e', seed.url, inspect(err));

                  try {
                    await consumeChannel.ack(msg); // ack regardless of http response code
                    log.info('consumer msg acknowledged of work done by fetcher_c');
                    resolve('processed single message with durable confirmation');
                  } catch (e) {
                    log.error(e);
                  } finally {
                    return;
                  }
                } else {
                  const {statusCode} = res;
                  htmlblob = body;

                  log.debug('server encoded data(headers) %s', inspect(res.headers));

                  if (statusCode !== 200) {
                    log.error('seed %s http code %s', seed.url, statusCode);
                  } else {
                    log.debug('reached end of request. seed %s http code %s', seed.url, statusCode);

                    let fetchBlob = {
                      _id: doc_id,
                      domain: seedUrl.hostname,
                      url: seed.url,
                      type: seed.type,
                      html: htmlblob
                    };

                    let page = WhirlpoolHTMLPage(fetchBlob);

                    page.save();

                    // publish to next exchange in the chain for further processing
                    // publish, ack method do not return a promise
                    try {
                      delete fetchBlob.html;
                      fetchBlob._id = doc_id.toString();
                      let ackpublish = await publish(publishChannel, fetchBlob);
                      log.info('published results of work done by fetcher_c %s', ackpublish);
                    } catch (e) {
                      reject(e);
                    } finally {
                      await consumeChannel.ack(msg); // ack regardless of http response code
                      log.info('consumer msg acknowledged of work done by fetcher_c');
                      resolve('processed single message with durable confirmation');
                    }// end of try/catch
                  } // end of if-else
                } //end of if-else
              }).on('socket', s => {
                s.on('lookup', (e, addr, f, h) => {
                  if (e) log.error('lookup e %s', inspect(e));

                  log.warn('socket event, lookup event addr %s, family %s, h %s, metrics %d ms',
                           inspect(addr), f, h,
                           process.hrtime(hrstart)[1]/1000000);
                  s.emit('agentRemove');
                });
              }).end(); //end of request module
    }); //end of consume channel
  }); // end of promise


  // handle connection closed
  rmqConn.on("close", (err) => {
    return reject(err);
  });

  // handle errors
  rmqConn.on("error", (err) => {
    return reject(err);
  });
} // end of async fetcher consume
