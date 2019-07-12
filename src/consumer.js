/*
 * Copyright (C) Rihan Pereira <rihen234@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint global-require: 'warn' */

import config from './helpers/config';
import logger from './helpers/applogging';

const amqp = require('amqplib');

logger.log('info', 'logging inside consumer script');
//// RabbitMQ connection string
//const messageQueueConnectionString = process.env.CLOUDAMQP_URL;
//
//async function setup() {
//  console.log("Setting up RabbitMQ Exchanges/Queues");
//
//  // connect to RabbitMQ Instance
//  let connection = await amqp.connect(messageQueueConnectionString);
//
//  // create a channel
//  let channel = await connection.createChannel();
//
//   // create 3 direct exchanges
//  await channel.assertExchange("due.ex.frontier", "direct", { durable: true });
//
//  await channel.assertExchange("fetcher.ex.parser", "direct", { durable: true });
//
//  await channel.assertExchange("urlfilter.ex.due", "direct", { durable: true });
//
//
//   // create queues
//  await channel.assertQueue("frontier.q", { durable: true });
//  await channel.assertQueue("fetcher.q", { durable: true });
//
//  await channel.assertQueue("parser.q", { durable: true });
//  await channel.assertQueue("contentseen.q", { durable: true });
//  await channel.assertQueue("urlfilter.q", { durable: true });
//
//  await channel.assertQueue("due.p", { durable: true });
//
//  // bind queues to due.ex.frontier exchange with a given key
//  await channel.bindQueue("frontier.q","due.ex.frontier", "due_p.to.frontier_c");
//  await channel.bindQueue("fetcher.q","due.ex.frontier", "frontier_p.to.fetcher_c");
//
//   // bind queues to fetcher.ex.parser exchange with a given key
//  await channel.bindQueue("parser.q","fetcher.ex.parser", "fetcher_p.to.parser_c");
//  await channel.bindQueue("contentseen.q","fetcher.ex.parser", "parser_p.to.contentseen_c");
//  await channel.bindQueue("urlfilter.q","fetcher.ex.parser", "parser_p.to.urlfilter_c");
//
//  // bind queues to urlfilter.ex.due exchange with a given key
//  await channel.bindQueue("due.q","urlfilter.ex.due", "urlfilter_p.to.due_c");
//
//  console.log("finished creating required exchanges, bindings, queus");
//  process.exit();
//}
//
//setup();
//
