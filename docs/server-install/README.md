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
pip3 install pillow numpy tqdm pygments
```


## (4) Cloudflare Encryption keys

To prepare for the encryption, go to Cloudflare's dashboard of your URL. Press on *SSL/TLS* >> *Origin Server* and create a new certificate.

Open your ssh connection and create/edit the *server.crt* file in your home directory:
```
nano server.crt
```
Paste the *Origin Certificate* from cloudflare, save (crtl + s) and exit (ctrl + x).

Repeat this process with the private key. The file's name should be ```server.key```.


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


## (6) Nginx

The server uses the proxy feature of nginx to implement easier and more secure SSL encryption to cloudflare. But first we have to install it:
```
sudo apt install nginx
```

Create and edit a new configuration file:
```
sudo nano /etc/nginx/conf.d/website.conf
```
and paste the following:
```
server {
  listen 80;
  listen [::]:80;

  server_name 87.106.192.248;

  location / {
      proxy_pass http://localhost:8000/;
  }
}
```

You should check the configuration by doing the following:
```
sudo nginx -t
```

If everything looks fine, reload nginx:
```
sudo nginx -s reload
```

If you open your browser an go to ```http://<server-ip>/```, you should get an unencrypted connection to the nodejs service.

<br>
<hr>
<br>

To enable cloudflare's encryption we have to again edit the configuration file:
```
sudo nano /etc/nginx/conf.d/website.conf
```
and make it look like the following:
```
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name 87.106.192.248;

  ssl_certificate /home/<username>/server.crt;
  ssl_certificate_key /home/<username>/server.key;

  location / {
      proxy_pass http://localhost:8000/;
  }
}
```

You should check the configuration by doing the following:
```
sudo nginx -t
```

If everything looks fine, reload nginx:
```
sudo nginx -s reload
```

If you open your browser an go to ```https://ramrath.me/```, you should get an encrypted connection to the server.
