stream-request [![Build Status](https://travis-ci.org/jsantell/stream-request.png)](https://travis-ci.org/jsantell/stream-request)
==============

Middleware for attaching a multipart/form-data stream to a `connect` request.

### Installing

* `npm install stream-request`

### Functions

* `streamRequest(options)` Takes an options object `options` and returns a function to be used as middleware.
### Usage

```javascript
var streamRequest = require('stream-request');
var express = require('express');
var app = express();

app.post('/upload', streamRequest(), function (req, res) {
  // If a multipart/form-data upload, a stream of the file
  // will be attached to the request object as `stream`.
  req.stream;

  // Send it back to the client for some strange reason
  res.send(req.stream);
});
```

### Options

* `filter` A function to be provided that receives a [multiparty `part` object](https://github.com/andrewrk/node-multiparty) which selects the file that returns true from the filter.

### Test

`npm install && npm test

### License

MIT License`
