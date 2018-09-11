const path = require('path');
const fs = require('fs');

if (process.argv.length < 3) {
    console.log("Недостаточно аргументов");
    process.exit();
}
if (process.argv.length > 3) {
    console.log("Слишком много аргументов");
    process.exit();
}

const DIR_PATH = process.argv[2];
const NEW_DIRECTORY = DIR_PATH + '\\' + path.basename(DIR_PATH);
let prefix = "";
const sum = fs.createWriteStream('summary.js');
let copyright = "";

// разбор и копирование содержимого директория
let readAndCopyDirectory = function (dir, prefix) {
    fs.readdir(dir, (err, files) => {
        if(err) {
            console.error("Ошибка чтения файлов в директории " + dir);
        } else {
            files.forEach(function(element) {
                let new_unit = dir + '\\' + element;
                if(fs.statSync(new_unit).isDirectory()) {
                    readAndCopyDirectory(new_unit, prefix + element + '/');
                } else {
                    sum.write('console.log(\'' + prefix + element + '\');\n');
                    // копирование файлов с добавлением copyright
                    let new_file = `${NEW_DIRECTORY}\\${path.basename(new_unit)}`;
                    let logger = fs.createWriteStream(new_file);
                    fs.readFile(new_unit, (err, data) => {
                        if(err) console.error("Произошла ошибка при копировании файла")
                        else logger.write(copyright + '\n\n-------\n' + data + '\n--------\n\n' + copyright);
                    });

                }
            }, this);
        }
    });
}

let createDir = function (callback) {
    // создание нового директория
    fs.access(NEW_DIRECTORY, (err) => {
        if(err && err.code == 'ENOENT') {
            fs.mkdir(NEW_DIRECTORY, (err) => {
                if (err) console.error("Произошла ошибка при создании директории");
            });
            fs.watch(NEW_DIRECTORY, (eventType, filename) => {
                console.log(`${eventType} - ${filename}`);
            });
        }
        else console.log("Такой директорий уже существует!");
    });
    // получение copyright
    fs.readFile("config.json", (err, data) => {
        if (err) console.error("Произошла ошибка при чтении файла")
        else {
            copyright = JSON.parse(data).copyright;
        }
    });
    callback();
}

createDir(() => readAndCopyDirectory(DIR_PATH, prefix));
