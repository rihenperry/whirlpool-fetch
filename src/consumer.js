import logger from './helpers/applogging';
import {fetcherPublish as publish} from './publish';

export let fetcherConsume = async function({connection, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("urlfrontier_p.to.fetcher_c", async function(msg) {
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);
      let ans;

      logger.log('info', 'fetch consumer received request to process ', JSON.stringify(data));

      // process the request

      // publish to next exchange in the chain for further processing
      try {
        ans = await publish(publishChannel);
        logger.log('info', 'published result %s', ans);

        await consumeChannel.ack(msg);
        resolve('consumer msg acknowledged');

      } catch(e) {
        logger.log('error', 'occured while publishing %s', e);
      }

    });

    // handle connection closed
    connection.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    connection.on("error", (err) => {
      return reject(err);
    });
  });
}
