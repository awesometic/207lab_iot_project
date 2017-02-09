# Suwon Univ. 207 Lab - IoT Project

## About this repository
This repository is for the project that has been performing by 207 laboratory at Suwon University since 2015. 11.<br>
And this is supported by Hanium ICT mentoring program<br>

### Hanium project members
* Her Sungmin - mentor
* Yang Deokgyu - team leader
* Lee Yootaek
* Sim Jeounghyeon
* Baek Soyoung
* Kang Eunjeoung
* Kim Seoungwang (Not in this project officially)

## What is this project?
Simply, the service of this project is to provide a solution that is associated with attendance management of the employees of any organization including any company or enterprise, school and so on<br>
With this service, the administrators can know all about attendance status of all of employees more easily<br>
Also they can show these things as visualized data<br>
Before use this service, be sure all employees have to install the Android application we made and of course, never remove that application<br>
The application detect where the user in and automatically send a commute information to server when the user is in or out of the specific places<br> 
To detect where is the specific place at Android application, each "specific" place must has 3 BLE beacons,<br>
and these beacons must be registered into the database that is used by this Node.js server<br>

### Github repository of mentioned Android application
This application has been developing by Lee Yootaek<br>
[GitHub - CommutingChecker by Lee Yootaek](https://github.com/eldbxor/CommutingChecker)<br>

## Requirement and Environment
### Needed pre-known languages and background of using frameworks in this project to development
* HTML
* CSS
* Javascript
* Skills of writing SQLs for MySQL or MariaDB
* Node.js and npm

### Used npm packages
* express.js
* node-mysql
* node-rsa
* node-schedule
* node-time
* async
* winston

### Framework to provide responsive website
* AdminLTE

### Framework to communicate between Node.js and Android devices
* socket.io

## How to execute this Node.js server
Clone this repository and install npm packages, rename default AdminLTE index page to avoid accessing wrong page. Then run as debugging mode<br>
```bash
git clone https://github.com/awesometic/207lab_iot_project.git
cd 207lab_iot_project
npm install
mv node_modules/admin-lte/index.html node_modules/admin-lte/index.html.backup
sudo DEBUG=app:* npm start
```

## Essential pre-installed database structure
You have to make database and tables into your DBMS to use this Node.js server properly<br>
```javascript
var pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : '207lab',
    password        : '207lab',
    database        : 'project_CM'
});
```
As you can see above code, you should make database named "project_CM",<br>
and add a user named '207lab' into your DBMS, give password '207lab' on it<br>
Or, you can just modify the code as you want. This code is involved in /public/libs/db.js<br>
Be sure you granted to "the user" to access "the project" through localhost<br>
This service requires database tables that is figured below<br>
* beacon
```sql
create table beacon (
    id_beacon int(11) not null primary key auto_increment,
    UUID char(32) not null,
    major char(4) not null,
    minor char(4) not null,
    beacon_address char(17) not null,
    id_workplace int(11) not null
);
```
* circumstance
```sql
create table circumstance (
    id_circumstance int(11) not null primary key auto_increment,
    datetime datetime not null,
    id_workplace int(11) not null,
    smartphone_addrss char(17) not null,
    commute_status tinyint(2) not null
);
```
* common
```sql
create table common (
    company_name varchar(20) not null,
    work_start_time time not null,
    work_end_time time not null
);
```
* department
```sql
create table department (
    id int(11) not null primary key auto_increment,
    name varchar(20) not null
);
```
* identity
```sql
create table identity (
    smartphone_address char(17) not null primary key,
    employee_number varchar(20) not null,
    name varchar(20) not null,
    password char(64) not null,
    id_department int(11) not null,
    id_position int(11) not null,
    permission tinyint(1) not null,
    admin tinyint(1) not null
);
```
* position
```sql
create table position (
    id int(11) not null primary key auto_increment,
    name varchar(20) not null,
    permission_level int(8) unsigned not null
);
```
* workplace
```sql
create table workplace (
    id_workplace int(11) not null primary key auto_increment,
    name_workplace varchar(20) not null,
    location_workplace varchar(20) not null,
    coordinateX int(5) not null,
    coordinateY int(5) not null,
    coordinateZ int(5) not null,
    thresholdX int(5) not null,
    thresholdY int(5) not null,
    thresholdZ int(5) not null,
    latitude float(10, 7) not null,
    longitude float(10, 7) not null,
    beacon_set tinyint(1) not null
);
```
After creating these tables, you have to put some data as default value into workplace, department, position tables<br>
You can insert default values like
```sql
insert into workplace values (-1, 'default', 'default', 0, 0, 0, 0, 0, 0, 0, 0, 1);
insert into department values (-1, 'default');
insert into position values (-1, 'default', 0);
insert into common values ('default', '09:00', '17:00');
```
And then, you have to add a user as administrator<br>
default ID: admin, password: admin<br>
Of course, you may change administrator's ID or password<br>
Before insert administrator user into your database, ensure you have finished the required previous step<br>
```sql
insert into identity values ('00:00:00:00:00:00', 'admin', 'admin', SHA2('admin', 256), -1, -1, 1, 1);
```
Finally, you'd better create relationships in your DBMS (use foreign key)<br>
It is not a necessary part, but to improve stability of system, it's worth it<br>
```sql
alter table circumstance add constraint FK_circumstance_workplace foreign key circumstance(id_workplace) references workplace(id_workplace);
alter table circumstance add constraint FK_circumstance_identity foreign key circumstance(smartphone_address) references identity(smartphone_address);
alter table identity add constraint FK_identity_department foreign key identity(id_department) references department(id);
alter table identity add constraint FK_identity_position foreign key identity(id_position) references project_CM.position(id);
alter table beacon add constraint FK_beacon_workplace foreign key beacon(id_workplace) references workplace(id_workplace);
```
Okay, now you can test/use our service<br>

## License
### express.js
(The MIT License)

Copyright (c) 2009-2014 TJ Holowaychuk <tj@vision-media.ca>
Copyright (c) 2013-2014 Roman Shtylman <shtylman+expressjs@gmail.com>
Copyright (c) 2014-2015 Douglas Christopher Wilson <doug@somethingdoug.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### node-mysql
Copyright (c) 2012 Felix Geisendörfer (felix@debuggable.com) and contributors

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 
### node-rsa
Copyright (c) 2014  rzcoder<br/>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
### node-schedule
Copyright (C) 2015 Matt Patenaude.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

### node-time
Copyright (c) 2011 Nathan Rajlich

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

### async
Copyright (c) 2010-2016 Caolan McMahon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 
### winston
Copyright (c) 2010 Charlie Robbins

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

### AdminLTE
The MIT License (MIT)

Copyright (c) 2014-2016 Abdullah Almsaeed

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### socket.io
(The MIT License)

Copyright (c) 2014-2015 Automattic <dev@cloudup.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contributors
Website design support by Kim Seoungwang<br>
D3.js chart support by Baek Soyoung, Kang Eunjeoung<br>

## Author
Yang Deokgyu a.k.a. Awesometic<br>
Repository created since 2016. 02.<br>