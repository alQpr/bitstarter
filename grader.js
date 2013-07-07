#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var http = require('http');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {

/////////////////////////////edits inserted here/////////////////////////////////////////////////
/* ///////////(still "pseudocode")/////////////////
var write2file = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            console.error("Wrote %s", indexfile);
            fs.writeFileSync(indexfile, result);
        }
    };

if(htmlfile is a url){rest.get(htmlfile).on('complete', write2file);}///////////still pseudocode

//OR//
var http = require('http');
var fs = require('fs');
if(htmlfile is a url){                                                          //////////still pseudocode
var file = fs.createWriteStream("download.html");
var request = http.get("http://qpr.ca", function(response) {response.pipe(file);});
htmlfile="download.html";
}

*/
////////////////////////////////////end of insert/////////////////////////////////////////////////////////

if(htmlfile.substring(0, 7) == "http://"){
var file = fs.createWriteStream("download2.html");
//NB This starts out empty!!!!!
//and we mustn't try to use it until it's been loaded
var request = http.get(htmlfile,
function(response) {response.pipe(file);}
                       );
//BUT!! mustn't try to use file until it's been loaded
//(need to make the rest wait until response finished)
// with something like
//.onreturn(proceed());

htmlfile="download.html";}
else{
htmlfile="index.html";
proceed();}
}
var proceed=function(){
console.log("htmlfile is "+htmlfile);

$ = cheerioHtmlFile("download.html");//htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html')//, clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
