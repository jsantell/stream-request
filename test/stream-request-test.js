var chai = require("chai");
var expect = chai.expect;
var express = require("express");
var request = require("request");
var bufferEqual = require("buffer-equal");
var streamRequest = require("../");
var PORT = 8940;

function postFile (formData, cb) {
  var req = request.post("http://localhost:" + PORT, cb);
  var form = req.form();
  Object.keys(formData).forEach(function (key) {
    form.append(key, formData[key]);
  });
}

function createBuffer (n) {
  var b = new Buffer(+n);
  b.fill((Math.random()*100000000).toFixed(0));
  return b;
}

function streamToBuffer (stream, cb) {
  var chunks = new Buffer([]);
  stream.on("data", function (chunk) {
    chunks = Buffer.concat([chunks, chunk], chunks.length + chunk.length);
  }).on("end", function () {
    cb(null, chunks);
  }).on("error", function (err) {
    cb(err);
  });
}

var server;

describe("stream-request: options", function () {
  beforeEach(function (done) {
    server ? server.close(done) : done();
  });

  describe("propertyName", function () {

    it("stores form data on custom `propertyName` when no fields given.", function (done) {
      var app = express();
      app.use(streamRequest({ propertyName: "custom", stream: "stream" }));
      app.use(function (req, res) {
        expect(req.custom.stream).to.be.ok;
        streamToBuffer(req.custom.stream, function (err, streamBuf) {
          expect(bufferEqual(streamBuf, buffer)).to.be.equal(true);
          res.send(200);
        });
      });

      try {
        server = app.listen(PORT);
      } catch (e) {
        server = app.listen(++PORT);
      }

      var buffer = createBuffer(1024 * 50);
      postFile({ stream: buffer }, function (err, res, body) {
        expect(err).to.not.be.ok;
        expect(res.statusCode).to.be.equal(200);
        server.close(done);
        server = null;
      });
    });

    it("stores form data on custom `propertyName` when multiple fields given.", function (done) {
      var app = express();
      app.use(streamRequest({ propertyName: "custom", stream: "stream" }));
      app.use(function (req, res) {
        expect(req.custom.stream).to.be.ok;
        expect(req.custom.other).to.be.equal("hello");
        streamToBuffer(req.custom.stream, function (err, streamBuf) {
          expect(bufferEqual(streamBuf, buffer)).to.be.equal(true);
          res.send(200);
        });
      });

      try {
        server = app.listen(PORT);
      } catch (e) {
        server = app.listen(++PORT);
      }

      var buffer = createBuffer(1024 * 50);
      postFile({ other: "hello", stream: buffer }, function (err, res, body) {
        expect(err).to.not.be.ok;
        expect(res.statusCode).to.be.equal(200);
        server.close(done);
        server = null;
      });
    });
  });
});

describe("stream-request; size testing", function () {
  beforeEach(function (done) {
    server ? server.close(done) : done();
  });

  it("attaches the multipart stream to the request object (100KB)", function (done) {
    var app = express();
    app.use(streamRequest({ stream: "buffer" }));
    app.use(function (req, res) {
      expect(req.body.buffer).to.be.ok;
      streamToBuffer(req.body.buffer, function (err, streamBuf) {
        expect(err).to.be.not.ok;
        expect(streamBuf.length).to.be.equal(1024 * 100);
        expect(bufferEqual(streamBuf, buffer)).to.be.equal(true);
        res.send(200);
      });
    });

    var buffer = createBuffer(1024 * 100); // 100KB
    try {
      server = app.listen(PORT);
    } catch (e) {
      server = app.listen(++PORT);
    }
    postFile({ buffer: buffer }, function (err, res, body) {
      expect(err).to.not.be.ok;
      expect(res.statusCode).to.be.equal(200);
      server.close(done);
      server = null;
    });
  });

  it("attaches the multipart stream to the request object (5MB)", function (done) {
    var app = express();
    app.use(streamRequest({ stream: "buffer" }));
    app.use(function (req, res) {
      expect(req.body.buffer).to.be.ok;
      streamToBuffer(req.body.buffer, function (err, streamBuf) {
        expect(err).to.be.not.ok;
        expect(streamBuf.length).to.be.equal(1024 * 1024 * 5);
        expect(bufferEqual(streamBuf, buffer)).to.be.equal(true);
        res.send(200);
      });
    });

    var buffer = createBuffer(1024 * 1024 * 5); // 5MB
    try {
      server = app.listen(PORT);
    } catch (e) {
      server = app.listen(++PORT);
    }
    postFile({ buffer: buffer }, function (err, res, body) {
      expect(err).to.not.be.ok;
      expect(res.statusCode).to.be.equal(200);
      server.close(done);
      server = null;
    });
  });

  it("attaches the multipart stream to the request object (50MB)", function (done) {
    // Big object, set a larger timeout (2 mins)
    this.timeout(1000 * 120);

    var app = express();
    app.use(streamRequest({ stream: "buffer" }));
    app.use(function (req, res) {
      expect(req.body.buffer).to.be.ok;
      streamToBuffer(req.body.buffer, function (err, streamBuf) {
        expect(err).to.be.not.ok;
        expect(streamBuf.length).to.be.equal(1024 * 1024 * 50);
        expect(bufferEqual(streamBuf, buffer)).to.be.equal(true);
        res.send(200);
      });
    });

    var buffer = createBuffer(1024 * 1024 * 50); // 50MB
    try {
      server = app.listen(PORT);
    } catch (e) {
      server = app.listen(++PORT);
    }
    postFile({ buffer: buffer }, function (err, res, body) {
      expect(err).to.not.be.ok;
      expect(res.statusCode).to.be.equal(200);
      server.close(done);
      server = null;
    });
  });

  it("doesn't attach anything when no files given", function (done) {
    var app = express();
    app.use(streamRequest({ stream: "buffer" }));
    app.use(function (req, res) {
      expect(req.stream).to.be.equal(undefined);
      res.send(200);
    });

    try {
      server = app.listen(PORT);
    } catch (e) {
      server = app.listen(++PORT);
    }

    request.post("http://localhost:" + PORT, function (err, res, body) {
      expect(err).to.not.be.ok;
      server.close(done);
      server = null;
    });
  });
});
