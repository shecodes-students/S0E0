#!/usr/bin/env node

var ejs = require('ejs');
var fs = require('fs');
var marked = require('marked');
var yaml = require('js-yaml');
var inspect = require('util').inspect;

var segments = [];
var currDoc = null;
// we receive meta data and text docs interleaved, starting with meta data
yaml.safeLoadAll(fs.readFileSync('episode.md', 'utf8'), function(doc) {
    if (currDoc !== null) {
        currDoc.text = doc;
        segments.push(currDoc);
        currDoc = null;
    } else {
        currDoc = doc;
    }
});
// console.error(inspect(yamlDocs, {depth: null}));

function render(segment) {
    var templateName = segment.template || 'section.ejs';
    var templatePath = 'templates/' + templateName;
    segment.text = marked(segment.text || '');
    var template = fs.readFileSync(templatePath, 'utf8');
    return ejs.render(template, segment);
} 

var content = segments.map(render).join('');
var layout = fs.readFileSync('layout.html', 'utf8');
var page = ejs.render(layout, {content: content});
console.log(page);

