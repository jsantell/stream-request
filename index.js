var multiparty = require("multiparty");
var CONTENT_TYPE_PARSE = /^multipart\/(?:form-data|related)(?:;|$)/i;
var shouldParse = function (req) {
  return !!CONTENT_TYPE_PARSE.exec(req.headers["content-type"]);
};

function streamRequest (options) {
  options = options || {};

  return function streamRequestMiddlewear (req, res, next) {
    var form = new multiparty.Form();

    if (!shouldParse(req)) {
      return next();
    }

    form.on("part", function (part) {

      // If a filter is provided, check that the part passes
      // the filter
      if (options.filter && !options.filter(part)) {
        return;
      }

      // If `filename` is null, this part is a field, not a file. In
      // this case where there is no filename for a file, this will be `undefined`,
      // which is allowed.
      if (part.filename === null) {
        return;
      }

      req.stream = part;
      next();
    });

    form.on("error", function (err) {
      next(err);
    });

    form.parse(req);
  };
}

module.exports = streamRequest;
