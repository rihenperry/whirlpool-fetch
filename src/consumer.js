import logger from './helpers/applogging';
import {fetcherPublish as publish} from './publish';
import {authMemcached} from './helpers/config.js';

const log = logger(module);
const memCacheConn = authMemcached();

export let fetcherConsume = async function({rmqConn, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("fetcher.q", async function(msg) {
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);

      log.info('fetch consumer received request to process ', data);

      // process the request

      // publish to next exchange in the chain for further processing
      // publish, ack method do not return a promise
      try {
        let ackpublish = await publish(publishChannel);
        log.info('published results of work done by fetcher_c %s', ackpublish);


        await consumeChannel.ack(msg);
        log.info('consumer msg acknowledged of work done by fetcher_c');

        resolve('processed single message with durable confirmation');
      } catch (e) {
        return reject(e);
      }
    });

    // handle connection closed
    rmqConn.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    rmqConn.on("error", (err) => {
      return reject(err);
    });
  });
}
