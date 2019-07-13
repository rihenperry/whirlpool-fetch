import logger from './helpers/applogging';
import {fetcherPublish as publish} from './publish';

export let fetcherConsume = async function({connection, consumeChannel, publishChannel}) {
  return new Promise((resolve, reject) => {
    consumeChannel.consume("fetcher.q", async function(msg) {
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);

      logger.log('info', 'fetch consumer received request to process ', data);

      // process the request

      // publish to next exchange in the chain for further processing
      // publish, ack method do not return a promise
      try {
        let ackpublish = await publish(publishChannel);
        logger.log('info', 'published results of work done by fetcher_c ', ackpublish);


        await consumeChannel.ack(msg);
        logger.log('info', 'consumer msg acknowledged of work done by fetcher_c');

        resolve('processed single message with durable confirmation');
      } catch (e) {
        return reject(e);
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
