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
if(htmlfile.substring(0, 7) == "http://")
{console.log("htmlfile is a url");
 return cheerio.load(rest.get(htmlfile));}
else
{console.log("htmlfile is a local file");
 return cheerio.load(fs.readFileSync(htmlfile));}
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile)
{
if(htmlfile.substring(0, 7) == "http://") 
  {download(htmlfile, check);}
else if(htmlfile.substring(0, 7) == "shttp://")
  {var doneHolder={done:false};
var nameHolder={name:"index.html"};
console.log("file to check is from "+htmlfile);

var file = fs.createWriteStream("download.html");
console.log("empty capture file created");

//when the write is complete we'll act on the filename
var action=function (err) 
{if(err) console.log("file write error");//throw err;
console.log('downoad is saved. Now checking the file');
nameHolder.name="download.html";
}  
//writedata will follow completion of http get request 
var writedata=function()    
{ doneHolder.done=true;
console.log("data obtained. Now writing to file");
//fs.writeFile("download.html",data,action);
} 
var request = rest.get(htmlfile).on('complete', 
//function(){console.log("complete!");});

writedata);

console.log("waiting for download and save of file");

while(!doneHolder.done)
{                     
console.log("get request not completed yet");
} 

while(nameHolder.name!="download.html")
{
console.log("download.html not written yet");
}

console.log("checking "+nameHolder.name);
return checkthefile(nameHolder.name,checksfile); 
   }else{

console.log("checking "+htmlfile+" (a local file)"); 
return checkthefile(htmlfile,checksfile);
        }
};


var checkthefile=function(htmlfile,checksfile){
console.log("file passed to checker is "+htmlfile);


var $ = cheerioHtmlFile(htmlfile);//filetocheck);

   var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};



// downloads html from the internet
// callback is called with two arguments: err, html
// where err is null if there is no error
function download(url, callback) {
    var resp = rest.get(url);
    resp.on('complete', function(result) {
        if (result instanceof Error) {
            // callback(result);
            sys.puts('Error: ' + result.message);
            this.retry(5000); // try again after 5 sec
            return;
        }
        callback(null, result);
    });
}




function check(err, html) {
        if (err) {
            console.log('Error getting html: ' + err);
            process.exit(1);
        }
        var checks = loadChecks(program.checks);
        var checkJson = checkHtml(html, checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    }


// checks html
function checkHtml(html, checks) {
    $ = cheerio.load(html);
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}




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
