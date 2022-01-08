exports.searchFunc = function(PM, keywords) {
    var results = {
        "categories": [],
        "projects": [],
        "posts": []
    };

    keywords.split(" ").forEach(keyword => {

        // Search in Categories
        PM.allCategories.forEach(category => {
            if(category.toLowerCase().search(keyword.toLowerCase()) != -1) {
                results["categories"].push(category);
            }
        });

        
        Object.values(PM.projects).forEach(project => {

            // search in project.details (description, slug, name ...)
            if(Object.values(project.details).find(value => {
                return value.toLowerCase().search(keyword.toLowerCase()) != -1;
            }) != undefined) {
                results["projects"].push(project);
            }


            // search in every post for ...
            Object.values(project.posts).forEach(post => {

                // ... post.details (description, slug, name) excluding name and slug of project
                if(Object.values(post.details).find(value => {
                    return value.toLowerCase().search(keyword.toLowerCase()) != -1;
                }) != undefined) {
                    results["posts"].push(post);
                }


                // ... the content of post
            });
        });
    });

    //detete empty arrays
    Object.keys(results).forEach(resultKey => {
        if(results[resultKey] .length == 0) {
            delete results[resultKey];
        }
    });

    console.log(results);

    return results;
}