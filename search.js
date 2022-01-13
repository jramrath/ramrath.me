const fs = require("fs"); // easy access to the server File system

exports.searchFunc = function(PM, keywords) {
    var results = {
        "categories": [],
        "projects": [],
        "posts": []
    };

    keywords.split(" ").forEach(keyword => {

        // Search in Categories
        Object.values(PM.allCategories).forEach(category => {
            if(category.toLowerCase().search(keyword.toLowerCase()) != -1) {
                if(!results["categories"].includes(category)) {
                    results["categories"].push(category);
                }
            }
        });

        
        Object.values(PM.projects).forEach(project => {

            // search in project.details (description, slug, name ...)
            if(Object.values(project.details).find(value => {
                return value.toLowerCase().search(keyword.toLowerCase()) != -1;
            })) {
                if(!results["projects"].includes(project)) {
                    results["projects"].push(project);
                }
            }


            // search in every post for ...
            Object.values(project.posts).forEach(post => {

                // ... post.details (description, slug, name) excluding name and slug of project and the content of the post
                if(Object.values(post.details).find(value => {
                    return value.toLowerCase().search(keyword.toLowerCase()) != -1;
                }) || fs.readFileSync(__dirname + post.dir + "/content.pug", { encoding:'utf8' }).split(" ").find(word => {
                    return word.toLowerCase().search(keyword.toLowerCase()) != -1;
                })) {
                    if(!results["posts"].includes(post)) {
                        results["posts"].push(post);
                    }
                }
            });
        });
    });

    // detete empty arrays    
    Object.keys(results).forEach(resultKey => {
        if(results[resultKey].length == 0) {
            delete results[resultKey];
        }
    });

    return results;
}