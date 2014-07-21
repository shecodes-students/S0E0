#!/usr/bin/env node

var _ = require('highland');
var ejs = require('ejs');
var fs = require('fs');
var marked = require('marked');
var yaml = require('js-yaml');
var inspect = require('util').inspect;

var compileReadingList = require('insertmode-reading-list');

function readYAMLDocs(filename) {
    var data = fs.readFileSync(filename, 'utf8');
    var docs = [];
    yaml.safeLoadAll(data, function(doc) {
        docs.push(doc);
    });
    return docs;
}
// we receive meta data and text docs interleaved, starting with meta data
var segments = _(readYAMLDocs('episode.md')).batch(2).map(function(l) {
    l[0].text = l[1];
    return l[0];
});

/* segments.toArray(function(x) {
    console.error(inspect(x, {depth: null}));
}); */

function render(segment, cb) {
    var templateName = segment.template || 'section.ejs';
    var templatePath = 'templates/' + templateName;
    segment.text = marked(segment.text || '');
    var template = fs.readFileSync(templatePath, 'utf8');
    if (segment.resources) {
        var yamlData = fs.readFileSync(segment.resources, 'utf8');
        var opts = {
            link_target: '_new',
            bookmarklet_link_text: 'S0E0'
        };
        compileReadingList(yamlData, opts, function(err, res) {
            if (err) return cb(err);
            segment.reading_list = res;
            cb(null, ejs.render(template, segment));
        });
    } else {
        cb(null, ejs.render(template, segment));
    } 
}

// concat rendered segments and put into layout
render = _.wrapCallback(render);
var content = segments.flatMap(render).collect();

var page = content.map(function(x) {
    var content = x.join('');
    var layout = fs.readFileSync('layout.html', 'utf8');
    return ejs.render(layout, {content: content});
}); 

page.pipe(process.stdout);
