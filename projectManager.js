const fs = require("fs");

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




exports.projects = {};
console.log("Importing projects ...");

fs.readdir(__dirname + "/projects", function(err, dirs) {
    dirs.forEach(dir => {
        exports.projects[dir] = new Project("/projects/" + dir);
        exports.projects[dir].getInfo();

        fs.readdir(__dirname + "/projects/" + dir, function(err, posts) {
            posts.forEach(post => {
                if(post != "projectDetails.json") {
                    exports.projects[dir].posts[post] = new Post("/projects/" + dir + "/" + post);
                    exports.projects[dir].posts[post].getInfo();
                }
            });
        });
    });
});