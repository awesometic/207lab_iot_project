# Suwon Univ. 207 Lab - IoT Project

## About this repository
This repository is for the project that has been performing by 207 laboratory at Suwon University since 2015. 11.<br>
And this is supported by Hanium ICT mentoring program<br>

### Project members
Yang Deokgyu<br>
Lee Yutaek<br>
Sim Jeounghyeon<br>
Baek Soyoung<br>
Kang Eunjeoung<br>
Kim Seoungwang (Not be in this project officially)<br>

## What is this project?
Simply, the service of this project is to provide a solution that is associated with attendance management of the employees of any organization including any company or enterprise, school and so on<br>
With this service, the administrators can know all about attendance status of all of employees more easily<br>
Also they can show these things as visualized data<br>
Before use this service, be sure all employees have to install the Android application we made and of course, never remove that application<br>
The application detect where the user in and automatically send a commute information to server when the user is in or out of the specific places<br> 
To detect where is the specific place at Android application, each "specific" place must has 3 BLE beacons,<br>
and these beacons must be registered into the database that is used by this Node.js server<br>

### Github repository of be mentioned Android application
This application has been developing by Lee Yutaek<br>
[GitHub](https://github.com/eldbxor/CommutingChecker)<br>

## Requirement and Environment
### Needed pre-known languages and background of be using frameworks in this project to development
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
Clone this repository and execute it as debugging mod<br>
```bash
git clone https://github.com/awesometic/207lab_iot_project.git
sudo DEBUG=app:* npm start
```
For now, all used npm packages are involved in this repository<br>
So you don't have to install dependency npm packages specified in package.json file<br>

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
As you see above code, you should make database named "project_CM",<br>
and add a user named '207lab' into your DBMS, give password '207lab' on it<br>
Or, you can just modify the code as you want<br>
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
    name varchar(20) not null
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

## Members
### Contributors
Website design support by Kim Seoungwang<br>
D3.js chart support by Baek Soyoung, Kang Eunjeoung<br>

### Author
Yang Deokgyu a.k.a. Awesomeitc<br>
Repository created since 2016. 02.<br>