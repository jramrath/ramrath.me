# Steps to initialize the VPS
This webisite is hosted on a server from [IONOS](https://ionos.de). The following are steps to initialize a VPS with this specific provider for this specific website.

## (1) Install VPS Image

First install an Image to the VPS by going to IONOS' cloudpanel and selecting the VPS. Press on *Actions* >> *Reinstall Image*. Choose *Debain* and press *Reinstall Image*.


## (2) user, password and ssh setup

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

To check if everything works logout and reconnect with your username and keyfile:
```
logout
ssh -i <path-to-keyfile> <username>@<server-ip>
```

After a successful connection we can continue by editing the sshd config file:
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

<hr>




