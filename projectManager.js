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
        this.categories;
    }

    getInfo() {
        this.details = JSON.parse(fs.readFileSync(__dirname + "/" + this.dir + "/projectDetails.json", "utf8"));
        this.categories = fs.readFileSync(__dirname + "/" + this.dir + "/categories", "utf8").split("\n");
    }
}


let Post = class {
    constructor(dir) {
        this.dir = dir;
        this.details;
    }

    getInfo() {
        this.details = JSON.parse(fs.readFileSync(__dirname + "/" + this.dir + "/postDetails.json", "utf8"));
    }
}




console.log("Importing projects ...");
exports.projects = {};
var allPosts = [];
exports.allCategories = [];

fs.readdirSync(__dirname + "/projects").forEach(dir => {
    exports.projects[dir] = new Project("/projects/" + dir);
    exports.projects[dir].getInfo();

    // only add category if it doesn't already exist
    exports.projects[dir].categories.forEach(newCategory => {
        if(!exports.allCategories.includes(newCategory)) {
            exports.allCategories.push(newCategory);
        }
    });

    fs.readdirSync(__dirname + "/projects/" + dir).forEach(post => {
        if(post != "projectDetails.json" && post != "categories") {
            exports.projects[dir].posts[post] = new Post("/projects/" + dir + "/" + post);
            exports.projects[dir].posts[post].getInfo();
            allPosts.push(exports.projects[dir].posts[post]);
        }
    });
});



console.log("Done importing projects.");

console.log("Sorting projects after creation date ...");
exports.sortedProjects = Object.values(exports.projects).sortByDate();
console.log("Done sorting projects.");

console.log("Getting recent posts ...");
exports.recentPosts = allPosts.sortByDate().slice(0, 2);
console.log("Done getting recent posts.");