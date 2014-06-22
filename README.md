stream-request [![Build Status](https://travis-ci.org/jsantell/stream-request.png)](https://travis-ci.org/jsantell/stream-request)
==============

Middleware for parsing data from a multipart/form-data request and putting data as streams onto a `connect` request.

Parses all parts in a multipart/form-data request and attaches them (much like `[body-parser](https://github.com/expressjs/body-parser)`), except stores a specified part (with the `stream` option) as a stream on the request object. To be used for large streaming file uploads, only one part can be used as a stream, and must be the last part in the request (otherwise the streamed part would have to be entirely consumed to advance to the next part, which defeats the purpose of this module).

### Installing

* `npm install stream-request`

### Functions

* `streamRequest(options)` Takes an options object `options` and returns a function to be used as connect middleware.

### Usage

```javascript
var streamRequest = require('stream-request');
var express = require('express');
var app = express();

app.post('/upload', streamRequest({ stream: "myfile" }), function (req, res) {
  // If a multipart/form-data upload, a stream of the file
  // will be attached to the request object as `stream`.
  req.body.stream;

  // Send it back to the client for some strange reason
  res.send(req.stream);
});
```

### Options

* `stream` - A string indicating which part name to use as a stream. **Required**.
* `propertyName` - The name of the property of the `connect` request object that the parsed data lives. Default: `body`.

### Test

`npm install && npm test`

### License

MIT License
