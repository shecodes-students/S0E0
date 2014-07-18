#!/usr/bin/env node

var ejs = require('ejs');
var fs = require('fs');
var marked = require('marked');

var ctx = {
    rl_html: fs.readFileSync('build/rl.html')
};
var content = marked(ejs.render(fs.readFileSync('episode.md', 'utf8'), ctx));
console.log(content);

