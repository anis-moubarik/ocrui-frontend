fs = require('fs');

exports.seleniumHost = 'localhost';
exports.seleniumPort = '4444';

exports.ocruiUrl = 'http://localhost/editor/';
exports.testItem = '04e6cb5a85a1de1112da276a8d6011e5'
exports.defaultPageUrl = exports.ocruiUrl+'#'+exports.testItem+'/11';
exports.testAuthor = 'Kaukoranta, Heikki'
exports.testTitle = 'Sarjakuvat'
exports.expectedContent = fs.readFileSync('content.txt');
exports.expectedNoLines = fs.readFileSync('contentNoLines.txt');

