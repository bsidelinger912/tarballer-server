/* eslint-disable strict, new-cap */
'use strict';

const request = require('request');
const zlib = require('zlib');
const tar = require('tar');

const headers = {
  'Accept-Encoding': 'gzip',
};

request({ url: 'http://localhost:3000/download?fileId=123', headers })
  .pipe(zlib.createGunzip()) // unzip
  .pipe(tar.Extract({ path: 'node_modules_test', strip: 1 }))
  .on('error', (err) => {
    console.log(err);
  });
