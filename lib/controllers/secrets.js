const { Router } = require('express');
const authenticate = require('../middleware/authenticate.js');
const { Secret } = require('../models/Secret.js');
// const authenticate = require('../middleware/authenticate.js');

module.exports = Router().get('/', [authenticate], async (req, res, next) => {
  try {
    const data = await Secret.getAll();
    res.json(data);
  } catch (error) {
    next(error);
  }
});
