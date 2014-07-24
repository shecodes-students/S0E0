#!/usr/bin/env node

var _ = require('highland');
var ejs = require('ejs');
var fs = require('fs');
var marked = require('marked');
var yaml = require('js-yaml');
var inspect = require('util').inspect;
var split = require('split');
var es = require('event-stream');

var compileReadingList = require('insertmode-reading-list');

function cutAtLine(filename) {
    return es.pipe(
        fs.createReadStream(filename, {encoding: 'utf8'}),
        split(/\r?\n\-{3,}\r?\n/)
    );
}
// we receive meta data and text docs interleaved, starting with meta data
var segments = _(cutAtLine('episode.md')).batch(2).map(function(l) {
    var obj = yaml.safeLoad(l[0]);
    obj.text = marked(l[1]);
    return obj;
});

/* segments.toArray(function(x) {
   console.error(inspect(x, {depth: null}));
}); */

var render = function(segment, cb) {
    var templateName = segment.template || 'section.ejs';
    var templatePath = 'templates/' + templateName;
    segment.marked = marked;
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
};

// concat rendered segments and put into layout
render = _.wrapCallback(render);
var content = segments.flatMap(render).collect();

var page = content.map(function(x) {
    var content = x.join('');
    var layout = fs.readFileSync('layout.html', 'utf8');
    return ejs.render(layout, {content: content});
}); 

page.pipe(process.stdout);
