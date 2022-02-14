const fs = require("fs");

Array.prototype.sortByDate = function() { // sorts projects or posts after date; newest first
    return this.slice(0).sort(function(a, b) {
        return (a.details["creationDateISO"] < b.details["creationDateISO"]) ? 1 : (a.details["creationDateISO"] > b.details["creationDateISO"]) ? -1 : 0;
    });
}




let Project = class {
    constructor(dir) {
        this.dir = dir;
        this.posts = {};
        this.details;
        this.categories = {};
    }
}


let Post = class {
    constructor(dir) {
        this.dir = dir;
        this.details;
    }
}



var versionNumber = JSON.parse(fs.readFileSync(__dirname + "/package.json"))["version"];
console.log("Starting Website with version " + versionNumber);
console.log();

console.log("Importing categories ...");
exports.allCategories = JSON.parse(fs.readFileSync(__dirname + "/categories.json", "utf8"));
console.log("Done importing categories.");


console.log("Importing projects ...");
exports.projects = {};
var allPosts = [];

fs.readdirSync(__dirname + "/projects").forEach(dir => {
    exports.projects[dir] = new Project("/projects/" + dir);

    exports.projects[dir].details = JSON.parse(fs.readFileSync(__dirname + "/" + exports.projects[dir].dir + "/projectDetails.json", "utf8"));
    exports.projects[dir].details["categories"].split(" ").forEach(category => {
        if(category != "") {
            exports.projects[dir].categories[category] = exports.allCategories[category];   
        }
    });

    fs.readdirSync(__dirname + "/projects/" + dir).forEach(post => {
        if(post != "projectDetails.json" && post != "categories") {
            exports.projects[dir].posts[post] = new Post("/projects/" + dir + "/" + post);

            exports.projects[dir].posts[post].details = JSON.parse(fs.readFileSync(__dirname + "/" + exports.projects[dir].posts[post].dir + "/postDetails.json", "utf8"));
            exports.projects[dir].posts[post].details["projectName"] = exports.projects[dir].details["name"];
            exports.projects[dir].posts[post].details["projectSlug"] = exports.projects[dir].details["slug"];

            allPosts.push(exports.projects[dir].posts[post]);
        }
    });
});
console.log("Done importing projects.");


console.log("Sorting projects after creation date ...");
exports.sortedProjects = Object.values(exports.projects).sortByDate();
console.log("Done sorting projects.");

console.log("Getting recent posts ...");
exports.recentPosts = allPosts.sortByDate().slice(0, 3);
console.log("Done getting recent posts.");
console.log();
