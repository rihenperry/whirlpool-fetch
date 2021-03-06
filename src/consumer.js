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
const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;

export let fetcherConsume = async function({rmqConn, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("fetcher.q", async function(msg) {
      let WhirlpoolHTMLPage = model('whirlpoolpage');

      let seed = JSON.parse(msg.content.toString());
      log.info('fetch downloading seed %s', inspect(seed));

      // configure request
      let hrstart = process.hrtime();
      let ltsCount = process.hrtime();
      let seedUrl = new URL(seed.url);
      let htmlblob = '';
      
      const options = {
        method: 'GET',
        uri: seedUrl,
        hostname: seedUrl.hostname,
        path: seedUrl.pathname,
        time: true,
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

          const dnsdiff = process.hrtime(hrstart);
          log.debug('dns entry caching %s, domain %s, metric %d ms',
                    inspect(r),
                    seedUrl.hostname,
                    ((dnsdiff[0] * NS_PER_SEC + dnsdiff[1]) * MS_PER_NS));
        })
      };

      /* dns cache */
      /* end of dns cache */
      request(options,
              async (err, res, body) => {

                try {
                  if (err) {
                  log.error('cannot process url %s, error %e', seed.url, inspect(err));
                  throw(err);
                } else {
                  const {statusCode} = res;
                  htmlblob = body;

                  log.debug('server encoded data(headers) %s', inspect(res.headers));

                  if (statusCode !== 200) {
                    let m = `seed ${seed.url} http code ${statusCode}`;
                    log.error(m);
                    throw(m);
                  } else {
                    const doc_id = new Types.ObjectId();
                    const ltsdiff = process.hrtime(ltsCount);
                    const ltsInMS = ((ltsdiff[0] * NS_PER_SEC + ltsdiff[1]) * MS_PER_NS);
                    const ltsInMSRound = Math.round((ltsInMS + Number.EPSILON) * 1000) / 1000;
                    log.debug('reached end of request. seed %s http code %s', seed.url, statusCode);
                    log.info('elapsed time %s ms', ltsInMSRound);

                    let fetchBlob = {
                      _id: doc_id,
                      domain: seedUrl.hostname,
                      url: seed.url,
                      type: seed.type,
                      html: htmlblob
                    };

                    const page = WhirlpoolHTMLPage(fetchBlob);

                    // publish to next exchange in the chain for further processing
                    // publish, ack method do not return a promise
                    delete fetchBlob.html;
                    fetchBlob['ltsInMS'] = ltsInMSRound;
                    fetchBlob._id = doc_id.toString();

                    const saved_page = await page.save();

                    if (saved_page === page) {
                      log.info(`doc ${doc_id} saved to mongodb`);
                      let ackpublish = await publish(publishChannel, fetchBlob);
                      log.info('published results of work done by fetcher_c %s', ackpublish);
                    } else {
                      let m = `doc ${doc_id} not saved to mongodb`;
                      throw(m);
                    }
                  } // end of if-else
                } //end of if-else
                } catch(e) {
                  log.error(e);
                } finally {
                  await consumeChannel.ack(msg); // ack regardless of http response code
                  log.info('consumer msg acknowledged of work done by fetcher_c');
                  resolve('processed single message with durable confirmation');
                } // end of try-catch-finally
              }).on('socket', s => {
                s.on('lookup', (e, addr, f, h) => {
                  if (e) log.error('lookup e %s', inspect(e));

                  const dnsdiff = process.hrtime(hrstart);

                  log.warn('socket event, lookup event addr %s, family %s, h %s, metrics %d ms',
                           inspect(addr), f, h,
                           ((dnsdiff[0] * NS_PER_SEC + dnsdiff[1]) * MS_PER_NS));
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
