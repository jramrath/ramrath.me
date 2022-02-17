# Steps to initialize the VPS
This webisite is hosted on a server from [IONOS](https://ionos.de). The following are steps to initialize a VPS with this specific provider for this specific website.

## (1) Install VPS Image

First install an Image to the VPS by going to IONOS' cloudpanel and selecting the VPS. Press on *Actions* >> *Reinstall Image*. Choose *Debain* and press *Reinstall Image*.


## (2) user, passwords and ssh setup

After the image has been successfully installed, connect through ssh with the root user (password and server-ip are displayed on the cloudpanel):
```
ssh root@<server-ip>
```

You should immediately change the root password:
```
passwd
```

Next, we create a new user and add it to the *sudo* group:
```
adduser <username>
usermod -aG sudo <username>
```

<hr>

To add your ssh keyfile, make a directory *.ssh* in \<username>'s home folder and add/edit the file *authorized_keys*:
```
mkdir /home/<username>/.ssh
nano /home/<username>/.ssh/authorized_keys
```

Paste the contents of your public keyfile (ex: id_rsa.pub), save (ctrl + s) and exit the file (ctrl + x).

To check if everything works, logout and reconnect with your username and keyfile:
```
logout
ssh -i <path-to-keyfile> <username>@<server-ip>
```

After a successful connection, we can continue by editing the sshd config file:
```
sudo nano /etc/ssh/sshd_config
```

You can take a look at the file I used [here](./sshd_config).

The output of
```
cat /etc/ssh/sshd_config | egrep -v "^\s*(#|$)"
```
should look something like this:
```
Include /etc/ssh/sshd_config.d/*.conf
PermitRootLogin no
PubkeyAuthentication yes
AuthorizedKeysFile      .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem       sftp    /usr/lib/openssh/sftp-server
PasswordAuthentication no
```


## (3) Repository setup

Clone this repository to your home folder and install nodejs, npm and pip:
```
git clone https://github.com/jramrath/ramrath.me.git
sudo apt install nodejs npm python3-pip
```

Now you can enter the repository folder, checkout to the master branch and install all necessary dependencies for nodejs and python:
```
cd ramrath.me
git checkout master
npm ci
pip3 install pillow numpy tqdm
```


## (4) Cloudflare Encryption keys




## (5) Systemd service

Create and edit the systemd file:
```
sudo nano /etc/systemd/system/website.service
```

Paste the following:
```
[Unit]
Description= Nodejs server for ramrath.me
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=jannik
ExecStart=/usr/bin/env node /home/jannik/ramrath.me/server.js

[Install]
WantedBy=multi-user.target
```

Save (ctrl + s) and exit (ctrl + x) the file.

Start the service and check it's output:
```
sudo systemctl start website
journalctl -f -u website.service
```

If everything looks fine exit journalctl (ctrl + c) and enable the service:
```
sudo systemctl enable wbesite
```