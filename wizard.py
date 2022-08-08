from textColor import tc
import os
import json
import time

class Main():
    def __init__(self):
        self.running = True

    def run(self):
        while self.running:
            print(tc.info("Choose one of the following: "))
            print("    (1) Show Projects & Posts")
            print("    (2) Add Project")
            print("    (3) Add Post")
            print("    (4) Update/Install")
            print("    (5) Generate new Captchas")
            print("    (6) Exit")

            x = input(tc.input(" "))

            print()

            if x == "1":
                self.listEntries()
            elif x == "2":
                self.addProject()
            elif x == "3":
                self.addPost()
            elif x == "4":
                self.update()
            elif x == "5":
                self.generateCaptcha()
            elif x == "6":
                print(tc.info("Exiting ..."))
                self.running = False
            else:
                print(tc.error("Please provide a valid input!"))
        
            print()


    def listEntries(self):
        for project in os.listdir("./projects/"):

            with open("./projects/" + project + "/projectDetails.json") as f:
                projectDetails = json.loads("".join(f.readlines()).replace("\n", ""))
                print(tc.green(projectDetails["name"]))

            for post in os.listdir("./projects/" + project + "/"):
                if post != "0" and post != "projectDetails.json":

                    with open("./projects/" + project + "/" + post + "/postDetails.json") as f:
                        postDetails = json.loads("".join(f.readlines()).replace("\n", ""))
                        print(tc.blue(" #" + postDetails["slug"] + ": " + postDetails["name"]))
            print()

    def addProject(self):
        projectDetails = {}

        projectDetails["creationDate"] = time.strftime("%d.%m.%Y")
        projectDetails["creationDateISO"] = time.strftime("%Y-%m-%d")

        projectDetails["name"] = input(tc.input("Name: "))
        projectDetails["slug"] = projectDetails["name"].lower().replace(" ", "-")

        newCategories = {}
        for category in input(tc.input("Categories (sepearated by ' '): ")).split(" "):
            newCategories[category.lower()] = category

        projectDetails["categories"] = " ".join(newCategories.keys())

        projectDetails["description"] = "This is a placeholder description. You can change it in this projects 'projectDetails.json' file"

        print()
        print(tc.info("This is the current Configuration:"))
        print(json.dumps(projectDetails, indent=4))
        
        x = input(tc.input("Is this fine? [Y/n] ")).lower()
        if x == "y" or x == "":
            print()

            # making directory of this project
            os.mkdir("./projects/" + projectDetails["slug"])

            # creating projectDetails.json and writing projectDetails to it
            with open("./projects/" + projectDetails["slug"] + "/projectDetails.json", "w") as f:
                json.dump(projectDetails, f, indent=4)

            # creating post '0' for the cover image
            os.mkdir("./projects/" + projectDetails["slug"] + "/0/")
            os.mkdir("./projects/" + projectDetails["slug"] + "/0/assets/")
            os.mkdir("./projects/" + projectDetails["slug"] + "/0/assets/img/")

            # checking if all categories are in 'categories.json'
            with open("./categories.json") as f:
                oldCategories = json.loads("".join(f.readlines()).replace("\n", ""))
            with open("./categories.json", "w") as f:
                json.dump({**oldCategories, **newCategories}, f, indent=4)

            # printing success message and steps to do now
            print(tc.output("Project {} has been successfully created!".format(projectDetails["name"])))
            print(tc.info("Steps you should do now:"))
            print("    1. Change the placeholder description in '{}'".format("./projects/" + projectDetails["slug"] + "/projectDetails.json"))
            print("    2. Add a cover image to '{}'".format("./projects/" + projectDetails["slug"] + "/0/assets/img/cover.png"))

            print()

            # asking if a post should be created
            print()
            if input(tc.input("Do you want to add a post to this project? [y/n]")).lower() == "y":
                self.addPost(project=projectDetails["slug"])



    def addPost(self, project=""):
        if project == "":
            print(tc.info("This is the current projects:"))
            for i, project in enumerate(os.listdir("./projects/")):
                print("    ({}) {}".format(i +1, project))

            project = os.listdir("./projects/")[int(input(tc.input("To which one do you want to add a post? "))) -1]
            print()

        print(tc.info("Using project {}".format(project)))

        print()

        postDetails = {}

        postDetails["creationDate"] = time.strftime("%d.%m.%Y")
        postDetails["creationDateISO"] = time.strftime("%Y-%m-%d")

        postDetails["name"] = input(tc.input("Name: "))
        postDetails["slug"] = str(len(os.listdir("./projects/" + project)) -1)

        postDetails["description"] = "This is a placeholder description. You can change it in this posts 'postDetails.json' file"

        print()
        print(tc.info("This is the current Configuration:"))
        print(json.dumps(postDetails, indent=4))

        x = input(tc.input("Is this fine? [Y/n] ")).lower()
        if x == "y" or x == "":
            print()

            # making directory of this post
            os.mkdir("./projects/" + project + "/" + postDetails["slug"])

            # creating postDetails.json and writing postDetails to it
            with open("./projects/" + project + "/" + postDetails["slug"] + "/postDetails.json", "w") as f:
                json.dump(postDetails, f, indent=4)

            # creating content.pug
            with open("./projects/" + project + "/" + postDetails["slug"] + "/content.pug", "w") as f:
                f.writelines("include ../../../views/template/postTemplates.pug\n\n")

            # creating folder structure for assets
            os.mkdir("./projects/" + project + "/" + postDetails["slug"] + "/assets/")
            os.mkdir("./projects/" + project + "/" + postDetails["slug"] + "/assets/img/")
            os.mkdir("./projects/" + project + "/" + postDetails["slug"] + "/assets/code/")
            os.mkdir("./projects/" + project + "/" + postDetails["slug"] + "/assets/video/")

            # printing success message and steps to do now
            print(tc.output("Post {} has been successfully created!".format(postDetails["name"])))
            print(tc.info("Steps you should do now:"))
            print("    1. Change the placeholder description in '{}'".format("./projects/" + project + "/" + postDetails["slug"] + "/postDetails.json"))
            print("    2. Add a cover image to '{}'".format("./projects/" + project + "/" + postDetails["slug"] + "/0/assets/img/cover.png"))
            print("    3. Add content to content.pug")


    def update(self):
        os.system("sudo -v")

        print()
        print(tc.info("Checkout to the develop branch:"))
        x = os.system("git checkout develop")
        if x == 0:
            print(tc.output("Successfully checked out to develop."))
        else:
            print(tc.error("Error while checking out to develop [{}]".format(x)))

        print()
        print(tc.info("Fetching from github:"))
        x = os.system("git fetch")
        if x == 0:
            print(tc.output("Successfully fetched from github."))
        else:
            print(tc.error("Error while fetching from github! [{}]".format(x)))

        print()
        print(tc.info("Pulling from github:"))
        x = os.system("git pull")
        if x == 0:
            print(tc.output("Successfully pulled from github."))
        else:
            print(tc.error("Error while pulling from github! [{}]".format(x)))

        print()
        print(tc.info("Update npm dependencies"))
        x = os.system("npm ci")
        if x == 0:
            print(tc.output("Successfully updated npm dependencies."))
        else:
            print(tc.error("Error while updating npm dependencies [{}]".format(x)))

        print()
        print(tc.info("Restarting website.service"))
        x = os.system("sudo systemctl restart website")
        if x == 0:
            print(tc.output("Successfully restarted website.service."))
        else:
            print(tc.error("Error while restarting website.service [{}]".format(x)))


    def generateCaptcha(self):
        print()
        print(tc.info("Executing './captcha/gen.py':"))
        x = os.system("python3 ./captcha/gen.py")
        if x == 0:
            print(tc.output("Successfully generated new captchas."))
        else:
            print(tc.error("Error while generating captchas [{}]".format(x)))


if __name__ == "__main__":
    main = Main()
    main.run()