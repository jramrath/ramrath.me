const fs = require("fs");

Array.prototype.sortByDate = function() {
    return this.slice(0).sort(function(a, b) {
        return (a.details["creationDate"] < b.details["creationDate"]) ? 1 : (a.details["creationDate"] > b.details["creationDate"]) ? -1 : 0;
    });
}




let Project = class {
    constructor(dir) {
        this.dir = dir;
        this.posts = {};
        this.details;
    }

    getInfo() {
        this.details = JSON.parse(fs.readFileSync(__dirname + "/" + this.dir + "/projectDetails.json", "utf8"));
    }
}


let Post = class {
    constructor(dir) {
        this.dir = dir;
        this.details;
        //this.contentPath;
    }

    getInfo() {
        this.details = JSON.parse(fs.readFileSync(__dirname + "/" + this.dir + "/postDetails.json", "utf8"));
        //this.contentPath = this.dir + "/content.pug";
    }
}




console.log("Importing projects ...");
exports.projects = {};
var allPosts = [];


fs.readdirSync(__dirname + "/projects").forEach(dir => {
    exports.projects[dir] = new Project("/projects/" + dir);
    exports.projects[dir].getInfo();

    fs.readdirSync(__dirname + "/projects/" + dir).forEach(post => {
        if(post != "projectDetails.json") {
            exports.projects[dir].posts[post] = new Post("/projects/" + dir + "/" + post);
            exports.projects[dir].posts[post].getInfo();
            allPosts.push(exports.projects[dir].posts[post]);
        }
    });
});



console.log("Done importing projects.");


console.log("Getting recent posts ...");

exports.recentPosts = allPosts.sortByDate().slice(0, 2);

console.log("Done getting recent posts.");