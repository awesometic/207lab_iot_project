# nodejs_simple_login
This is Node.js Project example

I've been testing this project on (will show you only necessary-modules for login)

* Node.js 5.8.0
* npm 3.7.3
* express-generator 4.13.1
* ejs 2.3.4
* express-session 1.13.0
* node-mysql 2.10.2
* Async 2.0.0
* MariaDB 10.1.12

And I would keep up with update

I've made this project with a command 
```
$ sudo express --ejs app
```
and I did following description,<br>
and installed two unprepared modules to make a something webpages providing login with session
```
$ sudo npm install mysql --save
$ sudo npm install express-session --save
$ sudo npm install socket.io --save
$ sudo npm install async --save
```

If you want to test this, you have to create a table on your DBMS(MySQL or MariaDB would be supported)<br>
like this,
```
create table users (
 	idx int(10) not null auto_increment primary key,
 	id varchar(30) not null,
 	password char(32) not null
);
```
The password will be stored into the table after encoding with MD5
