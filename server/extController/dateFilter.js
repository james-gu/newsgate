var News = require('../models/newsModel.js');

module.exports.dateFilter = function(req, res) {
  // res.send('yolo');
  News.find({"createdAt" : { $gt : new Date("2016-12-14T00:57:22.959Z") }})
  .then(function(value) {
    res.json(value);
  });

};