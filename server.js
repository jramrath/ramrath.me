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
        projects: PM.projects, 
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
            project_name: project.details["name"],
            post_name: "#" + post.details["slug"] + ": " + post.details["name"],
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


app.get("/downloadCode/", function(req, res) {
    res.sendFile(req.body["path"]);
});



app.all("*", function(req, res) {
    notFoundFunc(req, res);
});