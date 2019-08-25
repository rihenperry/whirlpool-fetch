const mongoose = require('mongoose');
import authMongoDB from '../helpers/config.js';

const Schema = mongoose.Schema;

const whirlpoolPageSchema = new Schema({
  domain: String,
  url: String,
  type: String
});


mongoose.model('whirlpoolpage', whirlpoolPageSchema, 'whirlpoolPages');
