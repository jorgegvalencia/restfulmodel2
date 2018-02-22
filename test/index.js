const request = require('supertest');

const Application = require('../app');
const categories = require('./categories');

const basePath = '/service';

const main = {
  Application,
  basePath,
};

const tasks = [
  categories(main),
];

const next = () => {
  const item = tasks.pop();
  if (!item) return process.exit(0);
  return item(next);
};

next();
