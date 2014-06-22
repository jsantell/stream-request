var multiparty = require("multiparty");
var CONTENT_TYPE_PARSE = /^multipart\/(?:form-data|related)(?:;|$)/i;
var shouldParse = function (req) {
  return !!CONTENT_TYPE_PARSE.exec(req.headers["content-type"]);
};

function streamRequest (options) {
  options = options || {};

  if (!options.propertyName) {
    options.propertyName = "body";
  }

  return function streamRequestMiddleware (req, res, next) {
    var form = new multiparty.Form();
    var body = req[options.propertyName] = {};
    var streamName = options.stream;
    var drainingStreams = 0;
    var completed = false;

    if (!shouldParse(req)) {
      return next();
    }

    form.on("part", function (part) {

      if (completed) {
        return;
      }

      // If `filename` is null, then this is a field not
      // a file
      if (part.filename === null) {
        part.resume();
        return;
      }

      // If this part is the part to be streamified,
      // finalize
      if (part.name === streamName) {
        body[streamName] = part;
        finalizeAttempt();
        return;
      }

      // This is just a part we will not pass along the stream, and
      // instead just drain it as a string.
      var value = "";
      drainingStreams++;
      part.on("data", function (data) {
        value += data;
      });

      part.on("end", function () {
        drainingStreams--;
        body[part.name] = value;
        finalizeAttempt();
      });
    });

    function finalizeAttempt () {
      // If still waiting for streams to drain,
      // abort.
      if (drainingStreams) {
        return;
      }

      // If already completed (like once a large file stream is finished and the multipart
      // parsing is completed), abort
      if (completed) {
        return;
      }

      completed = true;
      next();
    }

    form.on("error", function (err) {
      next(err);
    });

    form.on("close", finalizeAttempt);

    form.parse(req);
  };
}

module.exports = streamRequest;
