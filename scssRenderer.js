const fs = require("fs");
const sass = require('sass');

const cssPath = __dirname + "/public/css/";

exports.render = function() {
    console.log("");
    console.log("Removing old css files ...");

    fs.readdirSync(cssPath).forEach(file => {
        if(file.split(".").slice(-1)[0] === "css" || file.split(".").slice(-1)[0] === "map") {
            fs.unlinkSync(cssPath + file);
        }
    });

    console.log("Done removing old css files.");
    console.log("Generating new css files ...");

    fs.readdirSync(cssPath).forEach(file => {
        fs.writeFileSync(cssPath + file.split(".").slice(0, -1) + ".css", sass.renderSync({
            file: cssPath + file
        }).css);
    });

    console.log("Done Generating new css files.");
    console.log("");
}