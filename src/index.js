/* eslint-disable strict, new-cap */
'use strict';

const express = require('express');
const busboy = require('connect-busboy');
const fs = require('fs');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const bucketName = 'npm-tarballs';

const app = express();
app.use(express.static('public'));
app.use(busboy());

app.post('/upload', (req, res) => {
  req.pipe(req.busboy);

  req.busboy.on('file', (fieldname, file) => {
    const fileId = uuid.v1();
    const fileName = `node_modules.${fileId}.tar.gz`;
    const s3obj = new AWS.S3({ params: { Bucket: bucketName, Key: fileName } });

    console.log(`Uploading: ${fileName}`);

    s3obj.upload({ Body: file })
      // .on('httpUploadProgress', (evt) => { console.log(evt); })
      .send((err) => {
        if (err) {
          throw err;
        }

        /**
         * now write the version number into the tarball ref file
         */
        fs.writeFile('tarballer.json', `{ "tarball": "${fileName}"}`, (fileErr) => {
          if (fileErr) {
            throw fileErr;
          }

          console.log(`${fileName} uploaded`);
          res.json({ fileId });
        });
      });
  });
});

app.get('/download', (req, res) => {
  const fileId = req.query.fileId;

  if (!fileId) {
    return res.status(400).send('You must pass a fileId!');
  }

  const fileName = `node_modules.${fileId}.tar.gz`;
  const s3 = new AWS.S3();
  const params = { Bucket: bucketName, Key: fileName };

  // check if the tarball exists
  s3.headObject(params, (err, metadata) => {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(metadata);
      s3.getObject(params)
        .createReadStream()
        .pipe(res)
        .on('finish', () => {
          console.log('Tarball downloaded and response sent');
        });
    }
  });


});

app.listen(3000, () => {
  console.log('Tarballer server listening on port 3000!');
});
