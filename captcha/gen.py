from PIL import Image, ImageDraw
import random
import math
import os
import hashlib
import numpy as np
from tqdm import tqdm



class Gen():
    def __init__(self, numOfCaptchas):
        self.numOfCaptchas = numOfCaptchas
        self.directory = os.path.realpath(__file__).replace("/captcha/gen.py", "/public/captcha-img")
        print(self.directory)


    def reDoCaptchas(self):

        if not os.path.exists(os.path.realpath(__file__).replace("/captcha/gen.py", "/public/captcha-img")):
            os.mkdir(os.path.realpath(__file__).replace("/captcha/gen.py", "/public/captcha-img"))


        print("Deleting old Captchas!")

        for f in os.listdir(self.directory):
            os.remove(os.path.join(self.directory, f))

        print("Done!")
        print()
        print("Generating {} new Captchas!".format(self.numOfCaptchas))

        for c in tqdm(range(self.numOfCaptchas), desc="Generating..."):
            self.genCaptcha(c)

        print("Done!")



    def genCaptcha(self, index):
        time = (random.randint(0, 11), random.randint(0, 59))

        # calculate direction of minute arm (minutes * 6°[one minute])
        minute_dir = time[1] * 6

        # calculate direction of hour arm (hours * 30°[one hour] + minutes * .5°[one minute in the 30° hour])
        hour_dir = time[0] * 30 + time[1] * .5

        # arm length[minute(x, y), hour(x,y)]
        arm_length = [[0, 0], [0, 0]]

        for idx, direction in enumerate((minute_dir, hour_dir)):
            radius = (1150 if idx == 0 else 800)
            
            alpha = direction % 90
            section = (direction // 90)

            a = math.sin(math.radians(alpha)) * radius
            b = math.cos(math.radians(alpha)) * radius

            arm_length[idx][0] = (a if section % 2 == 0 else b) * (-1 if section // 2 == 1 else 1)
            arm_length[idx][1] = (a if section % 2 == 1 else b) * (-1 if section % 3 == 0 else 1)


        img = Image.open(os.path.realpath(__file__).replace("/gen.py", "/background.png"))

        draw = ImageDraw.Draw(img)

        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        draw.line((1350, 1350, 1350 + arm_length[0][0], 1350 + arm_length[0][1]), fill=color, width=25) # draw minute arm
        draw.line((1350, 1350, 1350 + arm_length[1][0], 1350 + arm_length[1][1]), fill=color, width=60) # draw hour arm


        for i in range(0, 8):
            pos = [[1350, 1950], [1950, 1350], [1350, 750], [750, 1350], [1050, 1050], [1650, 1650], [1050, 1650], [1650, 1050]][i]
            last = "NORTH"
            width = random.randint(5, 10)
            color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

            for n in range(random.randint(150, 300)):
                step = random.randint(20, 100)

                directions = ["NORTH", "EAST", "SOUTH", "WEST"]
                currentDirection = random.choices(directions)[0]

                if currentDirection == "NORTH":
                    delta_x = 0
                    delta_y = step

                elif currentDirection == "EAST":
                    delta_x = step
                    delta_y = 0

                elif currentDirection == "SOUTH":
                    delta_x = 0
                    delta_y = 0 - step

                else:
                    delta_x = 0 - step
                    delta_y = 0


                draw.line((pos[0], pos[1], pos[0] + delta_x, pos[1] + delta_y), fill=color, width=width)
                oldPos = pos
                pos = (pos[0] + delta_x, pos[1] + delta_y)

                # Check for collision with Circle
                if self.checkForCollision(oldPos, pos):
                    break

        timeHash = hashlib.sha256((str(time[0]) + ":" + str(time[1])).encode("utf-8")).hexdigest()
        img.save(self.directory + "/{}_{}.png".format(index, timeHash))





    def checkForCollision(self, pos1, pos2):
        m = np.array([1350, 1350])
        r = 900

        x = np.array(pos1)
        y = np.array(pos2)
        a = y - x
        b = m - x

        t = np.dot(a, b) / (np.linalg.norm(a) **2)
        t = (0 if t < 0 else t)
        t = (1 if t > 1 else t)
        
        d = x + a * t

        return np.linalg.norm(m - x) **2 >= r **2 # False: new position is outside of circle





if __name__ == "__main__":
    gen = Gen(int(input("Number of new Captchas: ")))
    gen.reDoCaptchas()
