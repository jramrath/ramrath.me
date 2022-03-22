from pygments import highlight
from pygments import lexers
from pygments.formatters.html import HtmlFormatter
from pygments.styles import get_style_by_name

import os
import shutil


class Main():
    def checkFiles(self):
        print("Removing old Files ...")

        '''
        for f in os.listdir(self.dirPath):
            if f.split(".")[-2] == "og":

                for ext in [".web.html", ".raw.txt"]:
                    fn = self.dirPath + ".".join(f.split(".")[:-2]) + ext
                    try:
                        os.remove(fn)
                    except FileNotFoundError:
                        print("Error: File '{}' not found -> File couldn't be removed. Continuing ...".format(fn))
        '''

        for project in os.listdir("./projects/"):
            for post in os.listdir("./projects/" + project):
                if os.path.isdir("./projects/" + project + "/" + post + "/assets/code/"):
                    for f in os.listdir("./projects/" + project + "/" + post + "/assets/code/"):

                        if f.split(".")[-2] == "og":

                            for ext in [".web.html", ".raw.txt"]:
                                fn = "./projects/" + project + "/" + post + "/assets/code/" + ".".join(f.split(".")[:-2]) + ext
                                try:
                                    os.remove(fn)
                                except FileNotFoundError:
                                    print("Error: File '{}' not found -> File couldn't be removed. Continuing ...".format(fn))



        print("Finished removing old Files.")

        print("Generating new Files ...")

        for project in os.listdir("./projects/"):
            for post in os.listdir("./projects/" + project):
                directory = "./projects/" + project + "/" + post + "/assets/code/"
                if os.path.isdir(directory):
                    for f in os.listdir(directory):

                        rawfn = ".".join(f.split(".")[:-2])

                        # Generating the .raw.txt file
                        shutil.copy(directory + f, directory + rawfn + ".raw.txt")

                        # Generating the .web.html file
                        self.hightlight(directory + f, directory + rawfn + ".web.html")

        print("Finished generating new Files.")
        

    def hightlight(self, src, dst):
        style = get_style_by_name('stata-dark')
        formatter = HtmlFormatter(full=False, linenos=True, style=style)
        lexer = lexers.get_lexer_for_filename(src)
        code = "".join(open(src).readlines())

        with open(dst, 'w') as f:
            f.write(highlight(code, lexer, formatter).replace("<pre>", "<pre><code>").replace("</pre>", "</code></pre>"))
        

if __name__ == "__main__":
    main = Main()
    main.checkFiles()