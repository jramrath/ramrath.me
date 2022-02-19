const bodyParser = require("body-parser"); 
const express = require("express"); // Expressjs
const fs = require("fs"); // easy access to the server File system
const http = require("http");   // creates the Server without the ssl certificates (dev mode)
const path = require("path");
const crypto = require("crypto"); // hashing algorithm
const pug = require("pug"); // pug rendering Engine
const { lookup }  = require("geoip-lite");

const PM = require("./projectManager.js");
const scssRenderer = require("./scssRenderer.js");
const search = require("./search.js");

const app = express();
const directoryToServer = __dirname + "/public";
const port = 8000;

var clients = {};

app.use(express.static(directoryToServer));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

scssRenderer.render();

http.createServer(app).listen(port, () => {
    console.log(`listening on port ${port}`);
});


// -------------------------------------------------------------------------------------------------------

let render = (req, res, path, options = {}) => {
    res.render(path, Object.assign({}, options, {
        remoteAddress: req.headers["x-forwarded-for"],
        wdPath: __dirname
    }));
}

let includeFunc = (path, options = {}) => {
    if(path.slice(-4, ) == ".pug") {
        return pug.renderFile(path, Object.assign({}, options, {
            include: includeFunc,
            wdPath: __dirname
        }));
    }
    else {
        return fs.readFileSync(path);
    }
}

let notFoundFunc = (req, res) => {
    res.status(404);
    render(req, res, "404.pug");
}

// -------------------------------------------------------------------------------------------------------


app.get("/", function(req, res) {
    render(req, res, "home.pug", { 
        current: "home",
        recentPosts: PM.recentPosts
    });
});


app.get("/about/", function(req, res) {
    render(req, res, "about.pug", { 
        current: "about"
    });
});


app.get("/projects/", function(req, res) {
    render(req, res, "project-overview.pug", { 
        projects: PM.sortedProjects,
        current: "projects"
    });
});


app.get("/projects/:name", function(req, res) {
    const project = PM.projects[req.params.name]

    if(project) {
        render(req, res, "post-overview.pug", { 
            project: project
        });
    }
    else {
        notFoundFunc(req, res);
    }
    
});


app.get("/projects/:name/:post", function(req, res) {
    const project = PM.projects[req.params.name];
    const post = project.posts[req.params.post];
    const nextPost = project.posts[(parseInt(req.params.post) +1).toString()]

    if(project && post) {
        render(req, res, "post.pug", {
            post: post,
            path: __dirname + post.dir + "/content.pug",
            include: includeFunc,
            nextPost: nextPost == undefined ? "" : nextPost 
        });
    }
    else {
        notFoundFunc(req, res);
    }
})


app.get("/contact/", function(req, res) {
    fs.readdir(__dirname + "/public/captcha-img/", function(err, files) {
        var file = files[Math.floor(Math.random() * files.length)];
        var id = Math.floor(Math.random() * Math.pow(10, 16));
        
        clients[id] = file.split("_")[1].slice(0, -4);

        render(req, res, "captcha.pug", { 
            src: path.join("/captcha-img", file), 
            id: id
        });
    });
});


app.post("/contact/", function(req, res) {
    var result = req.body["hours"] + ":" + req.body["minutes"];
    var hashedResult = crypto.createHash("sha256").update(result).digest("hex");

    if(clients[req.body["id"]] == hashedResult) {
        render(req, res, "contact.pug", {
            current: "contact"
        });
    }
    else {
        render(req, res, "captchaFailed.pug");
    }
    delete clients[req.body["id"]];
})


app.get("/user-data/", function(req, res) {
    var options = req.headers["x-forwarded-for"] != null ? {
        ip: req.headers["x-forwarded-for"],
        user_agent: req.headers["user-agent"],
        country: lookup(req.headers["x-forwarded-for"])["country"],
        region: lookup(req.headers["x-forwarded-for"])["region"],
        city: lookup(req.headers["x-forwarded-for"])["city"],
        coordinates: lookup(req.headers["x-forwarded-for"])["ll"][0] + " " + lookup(req.headers["x-forwarded-for"])["ll"][1],
        timezone: lookup(req.headers["x-forwarded-for"])["timezone"]
    } : {
        ip: "N/A",
        user_agent: "N/A",
        country: "N/A",
        region: "N/A",
        city: "N/A",
        coordinates: "N/A",
        timezone: "N/A"
    };

    render(req, res, "user-data.pug", options);
});


app.get("/donations/", function(req, res) {
    render(req, res, "donations.pug");
});


app.get("/search/", function(req, res) {
    render(req, res, "search.pug");
});


app.post("/search/", function(req, res) {
    render(req, res, "search.pug", {
        searchResults: search.searchFunc(PM, req.body["search-input"]),
        searchInput: req.body["search-input"]
    });
});


app.get("/categories/", function(req, res) {
    render(req, res, "category-overview.pug", {
        categories: PM.allCategories
    });
});


app.get("/categories/:category", function(req, res) {
    var category = req.params.category.toLowerCase();

    if(PM.allCategories[category]) {
        var projects = [];
        Object.values(PM.projects).forEach(project => {
            if(Object.keys(project.categories).find(currentCategory => {
                return currentCategory == category;
            })) {
                projects.push(project);
            }
        });

        render(req, res, "category.pug", {
            category: category,
            allCategories: PM.allCategories,
            projectsInCategory: projects
        });
    }
    else {
        notFoundFunc(req, res);
    }
});


app.get("/typo", function(req, res) {
    var location = ""
    if(req.query.project != undefined && req.query.post != undefined) {
        location = "/projects/" + req.query.project + "/" + req.query.post;
    }

    render(req, res, "typo.pug", {
        location: location || ""
    });
});


app.post("/typo", function(req, res) {
    var typo = [req.body["typo_location"], req.body["typo_description"]];

    if(!fs.existsSync(__dirname + "/typos")) {
        fs.mkdirSync(__dirname + "/typos");
    }

    fs.writeFile(__dirname + "/typos/" + crypto.createHash("sha256").update(typo[0] + typo[1]).digest("hex"), "location: " + typo[0] + "\nDescription: " + typo[1], err => {
        console.error(err);
    });

    render(req, res, "typoConfirmation.pug");
});




app.all("*", function(req, res) {
    notFoundFunc(req, res);
});