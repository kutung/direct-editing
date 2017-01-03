/*eslint-env node, amd */

var customer, inputDir, outputDir,
    fs = require('fs'),
    path = require('path'),
    requireModule = require('amdrequire'),
    folders = [],
    localeJson = {};

if (process.argv.length <= 2) {
    console.log('Usage: ' + __filename + ' path/to/directory');
    process.exit(-1);
}

inputDir = process.argv[2];
outputDir = process.argv[3];
customer = process.argv[4];

function assignObject(filePath) {
    requireModule([filePath.replace('.js', '')], function loadLocale(locale) {
        Object.assign(localeJson, locale);
    });
}

function folderTraversal(folder) {
    var files,
        folderPath = path.join(inputDir, folder),
        stat = fs.lstatSync(folderPath),
        data = [];

    if (stat.isDirectory() === true) {
        files = fs.readdirSync(folderPath);
        files.forEach(function eachFile(file) {
            if (path.extname(file) === '.js') {
                assignObject(path.join(folder, file));
            }
        });
        try {
            fs.accessSync(path.join(folderPath, customer), fs.F_OK);
            folderTraversal(path.join(folder, customer));
        }
        catch (e) {

        }
        if (folder.indexOf(customer) > -1) {
            return;
        }
        data.push(JSON.stringify(localeJson));
        fs.writeFileSync(path.join(outputDir, folder) + '.json', data.join(''));
    }
}

fs.accessSync(inputDir, fs.F_OK);
fs.accessSync(outputDir, fs.F_OK);
folders = fs.readdirSync(inputDir);
requireModule.config({
    'basePath': inputDir
});

folders.forEach(folderTraversal);
