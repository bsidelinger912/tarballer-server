/* eslint-disable strict */
'use strict';

const fs = require('fs');
const request = require('request');

const file = { my_file: fs.createReadStream(`${process.cwd()}/node_modules.tar.gz`) };

request.post({ url: 'http://localhost:3000/upload', formData: file }, (err, httpResponse, body) => {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});
