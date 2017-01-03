/*eslint-env node, amd */

var fs = require('fs'),
    requireModule = require('amdrequire'),
    path, folders = [], localeJson = {}, outputDir;

if (process.argv.length <= 2) {
    console.log('Usage: ' + __filename + ' path/to/directory');
    process.exit(-1);
}

path = process.argv[2];
outputDir = process.argv[3];

fs.accessSync(path, fs.F_OK);
fs.accessSync(outputDir, fs.F_OK);
folders = fs.readdirSync(path);
requireModule.config({
    'basePath': path
});

folders.forEach(function eachFolder(folder) {
    var files = fs.readdirSync(path + '/' + folder), data = [];

    files.forEach(function eachFile(file) {
        requireModule([folder + '/' + file.replace('.js', '')], function loadLocale(locale) {
            Object.assign(localeJson, locale);
        });
    });

    data.push('define([], function localeLoader() {\n');
    data.push('    var locale = ');
    data.push(JSON.stringify(localeJson));
    data.push(';\n\n');
    data.push('    return locale;\n});');
    fs.writeFileSync(outputDir + '/' + folder + '.js', data.join(''));
});
