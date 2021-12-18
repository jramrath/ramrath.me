const bodyParser = require("body-parser"); 
const express = require("express"); // Expressjs
const fs = require("fs"); // easy access to the server File system
const https = require("https"); // creates the Server with the ssl certificate
const path = require("path");
const crypto = require("crypto"); // hashing algorithm
const pug = require("pug"); // pug rendering Engine
const { lookup }  = require("geoip-lite");

const PM = require("./projectManager.js");
const { check } = require("node_cloudflare");
const { EDESTADDRREQ } = require("constants");

const app = express();
const directoryToServer = __dirname + "/public";
const port = 443;

var clients = {};

app.use(express.static(directoryToServer));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

const httpsOptions = {
    cert: fs.readFileSync(__dirname + "/ssl/server.crt"), 
    key: fs.readFileSync(__dirname + "/ssl/server.key")
}

https.createServer(httpsOptions, app).listen(port, function() {
    console.log(`listening at port ${port}`);
});


// -------------------------------------------------------------------------------------------------------

let includeFunc = (path, options = {}) => {
    return pug.renderFile(path, options);
}

let notFoundFunc = (req, res) => {
    res.status(404).render("404.pug", {
        remoteAddress: req.headers["x-forwarded-for"]
    });
}

// -------------------------------------------------------------------------------------------------------


app.get("/", function(req, res) {
    res.render("home.pug", { 
        remoteAddress: req.headers["x-forwarded-for"],
        current: "home"
    });
});


app.get("/about/", function(req, res) {
    res.render("about.pug", { 
        remoteAddress: req.headers["x-forwarded-for"],
        current: "about"
    });
});


app.get("/projects/", function(req, res) {
    res.render("project-overview.pug", { 
        projects: PM.projects, 
        remoteAddress: req.headers["x-forwarded-for"],
        current: "projects"
    });
});


app.get("/projects/:name", function(req, res) {
    const project = PM.projects[req.params.name]

    if(project) {
        res.render("post-overview.pug", { 
            project: project, 
            remoteAddress: req.headers["x-forwarded-for"]
        });
    }
    else {
        notFoundFunc(req, res);
    }
    
});


app.get("/projects/:name/:post", function(req, res) {
    const project = PM.projects[req.params.name];
    const post = project.posts[req.params.post];

    if(project && post) {
        res.render("post.pug", {
            project_name: project.details["name"],
            post_name: "#" + post.details["slug"] + ": " + post.details["name"],
            remoteAddress: req.headers["x-forwarded-for"],
            path: __dirname + post.dir + "/content.pug",
            include: includeFunc,
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
        
        clients[id] = file.slice(0, -4);

        res.render("captcha.pug", { 
            src: path.join("/captcha-img", file), 
            id: id, 
            remoteAddress: req.headers["x-forwarded-for"]
        });
    });
});


app.post("/contact/", function(req, res) {
    var result = req.body["hours"] + ":" + req.body["minutes"];
    var hashedResult = crypto.createHash("sha256").update(result).digest("hex");

    if(clients[req.body["id"]] == hashedResult) {
        res.render("contact.pug", { 
            remoteAddress: req.headers["x-forwarded-for"],
            current: "contact"
        });
    }
    else {
        res.render("captchaFailed.pug", { 
            remoteAddress: req.headers["x-forwarded-for"]
        });
    }
    delete clients[req.body["id"]];
})


app.get("/user-data/", function(req, res) {
    res.render("user-data.pug", {
        remoteAddress: req.headers["x-forwarded-for"],
        ip: req.headers["x-forwarded-for"],
        user_agent: req.headers["user-agent"],
        country: lookup(req.headers["x-forwarded-for"])["country"],
        region: lookup(req.headers["x-forwarded-for"])["region"],
        city: lookup(req.headers["x-forwarded-for"])["city"],
        coordinates: lookup(req.headers["x-forwarded-for"])["ll"][0] + " " + lookup(req.headers["x-forwarded-for"])["ll"][1],
        timezone: lookup(req.headers["x-forwarded-for"])["timezone"]
    });
});


app.get("/donations/", function(req, res) {
    res.render("donations.pug", {
        remoteAddress: req.headers["x-forwarded-for"]
    })
});


app.get("/downloadCode/", function(req, res) {
    res.sendFile(req.body["path"]);
});



app.all("*", function(req, res) {
    notFoundFunc(req, res);
});