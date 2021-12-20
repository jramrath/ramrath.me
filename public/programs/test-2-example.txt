class Gen():
    def __init__(self):
        self.numOfCaptchas = 500
        self.directory = "../public/captcha-img"
        print(self.directory)

    def reDoCaptchas(self):
        print("Deleting old Captchas!")

        for f in os.listdir(self.directory):
            os.remove(os.path.join(self.directory, f))

        print("Done!")
        print()
        print("Generating {} new Captchas!".format(self.numOfCaptchas))

        for c in tqdm(range(self.numOfCaptchas), desc="Generating..."):
            self.genCaptcha()

        print("Done!")