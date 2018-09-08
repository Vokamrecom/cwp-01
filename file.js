var fs = require('fs');
var path = require('path');

const DIR_PATH = process.argv[2];
const EXTENSION = '.txt';
let	  COPYRIGHT;

(() => {
    fs.access(
        DIR_PATH,
        (e) => {
            if (e) { console.log("Path access error: " + e); }
            else {
                createSummaryScript();
                getCopyright();
                copyTXT(DIR_PATH, createDirForTXT());
                getChanges();
            }
        }
    )
})();

function createDirForTXT() {
    let DIR = `${DIR_PATH}\\${path.basename(DIR_PATH)}`;
    fs.mkdir(DIR, (callback) => {
        if (callback) {
            console.log("Error create dir for txt: " + callback);
            throw callback;
        }
    });
    return DIR;
}

function createSummaryScript() {
    fs.writeFile(
        `${DIR_PATH}\\summary.js`,
        'const fs = require(\'fs\');\n' +
        'const path = require(\'path\');\n' +
        '\n' +
        '(function getFiles(baseDir) {\n' +
        '    fs.readdir(baseDir, function (e, files){\n' +
        '        for (let i in files) {\n' +
        '            let CURDIR = baseDir + path.sep + files[i];\n' +
        '            fs.stat(CURDIR, (e, stats) => {\n' +
        '                    if (stats.isDirectory()) {\n' +
        '                        getFiles(CURDIR);\n' +
        '                    } else {\n' +
        '                        console.log(path.relative(__dirname, CURDIR));\n' +
        '                    }\n' +
        '                }\n' +
        '            );\n' +
        '        }\n' +
        '    });\n' +
        '})(__dirname, null);',
        (callback) => {
            if (callback) { console.log("Error create summary script: " + callback); }
        }
    );
}

function getCopyright() {
    fs.readFile("config.json", (e, d) => {
        if (e) {
            console.log("Error read file: " + e);
            copyright = '#DEFAULT#COPYRIGHT#WREST#2018#';
        }
        else { copyright = JSON.parse(d); }
    })}

function copyTXT(dir, enddir) {
    fs.readdir(dir, function (e, files) {
        if (e) { console.log("Error read: " + e); }
        else {
            for (let file in files) {
                let CURFILE = `${dir}\\${files[file]}`;
                if (fs.statSync(CURFILE).isDirectory()) {
                    copyTXT(CURFILE, enddir);
                }
                else{
                    if(path.extname(CURFILE) === EXTENSION) {
                        fs.readFile(CURFILE, 'utf8', (e, data) => {
                            if (e) { console.log(`can't read file ${CURFILE}: `+ e); }
                            else { addCopyright(enddir + path.sep + files[file], data); }
                        })
                    }
                }
            }
        }
    })
}

function addCopyright(path, data) {
    fs.appendFile(
        path,
        copyright["copyright"] + data + copyright["copyright"],
        'utf8',
        (callback) => {
            if (callback) { console.log("Error in add copyright: " + callback); }
        }
    );
}

function getChanges() {
    fs.watch(DIR_PATH, (e, f) => { if (f) { console.log(f.toString()); } });
}