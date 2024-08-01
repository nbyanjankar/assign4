/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Nigan Byanjankar     Student ID: 151732237   Date: 2024/07/25
*
* Online (Heroku) Link: https://nbyanjankarassign4-278cf242585b.herokuapp.com/
*
********************************************************************************/

const express = require('express');
const path = require('path');
const collegeData = require("./modules/collegeData");
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const HTTP_PORT = process.env.PORT || 8080; 
const exphbs = require('express-handlebars');

const studentsFilePath = path.join(__dirname, 'data', 'students.json');
let students = [];

app.set('views', __dirname + '/Views');

// Serve static files from the 'Public' directory
app.use(express.static(__dirname + '/Public'));

app.use(express.static('Public'));

const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');



app.use(bodyParser.urlencoded({ extended: true }));

// Initialize data on server start
collegeData.initialize()
    .then(() => {
        // Start server after successful data initialization
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on port: ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.error("Initialization failed:", err);
    });

// Route for home.html
app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, '/views/home.html'));
    res.render('home');
});


// Route for about.html (assuming you create this file)
app.get("/about", (req, res) => {
//     res.sendFile(path.join(__dirname, '/views/about.html'));
    res.render('about');
});

// Route for htmlDemo.html (assuming you create this file)
app.get("/htmlDemo", (req, res) => {
    // res.sendFile(path.join(__dirname, '/views/htmldemo.html'));
    res.render('htmlDemo');
});

app.get("/students/add", (req, res) => {
    // res.sendFile(path.join(__dirname, '/views/addStudent.html'));
    res.render('addStudent');
});

app.get("/singlestudent", (req, res) => {
    res.render('singlestd');
});
app.get("/updatestd", (req, res) => {
    res.render('updatestd');
});

// middleware
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});




app.get('/students', (req, res) => {
    fs.readFile('./data/students.json', 'utf8', (err, data) => {
        if (err) {
            return res.render('students', { message: "no results" });
        }
        let students = JSON.parse(data);
        res.render('students', { students: students });
    });
});

app.get('/courses', (req, res) => {
    fs.readFile('./data/courses.json', 'utf8', (err, data) => {
        if (err) {
            return res.render('courses', { message: "no results" });
        }
        let courses = JSON.parse(data);
        res.render('courses', { courses: courses });
    });
});
app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(course => {
            res.render('course', { course });
        })
        .catch(err => {
            res.status(404).send(err);
        });
});



// Example route for /students by course
app.get("/studentscourse", (req, res) => {
    const course = req.query.course;
    if (course) {
        collegeData.getStudentsByCourse(course)
            .then((students) => {
                res.json(students);
            })
            .catch((err) => {
                res.status(500).json({ message: "Error fetching students by course", error: err });
            });
    } else {
        collegeData.getAllStudents()
            .then((students) => {
                res.json(students);
            })
            .catch((err) => {
                res.status(500).json({ message: "Error fetching students", error: err });
            });
    }
});

fs.readFile(studentsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading students file:', err);
        return;
    }
    students = JSON.parse(data);
});
app.use((req, res, next) => {
    res.locals.students = students;
    next();
});

app.get('/student', (req, res) => {
    const studentNum = parseInt(req.query.studentNum, 10); // Convert input to integer
    if (isNaN(studentNum)) {
        return res.render('student', { message: 'Invalid student number' });
    }

    const student = students.find(s => s.studentNum === studentNum);

    if (student) {
        res.render('student', { student });
    } else {
        res.render('student', { message: 'Student not found' });
    }
});

app.get('/student', (req, res) => {
    console.log('Query Parameters:', req.query); // Log query parameters
    
    const studentNum = parseInt(req.query.studentNum, 10); // Convert input to integer
    console.log('Converted studentNum:', studentNum); // Log converted student number

    if (isNaN(studentNum)) {
        return res.render('student', { message: 'Invalid student number' });
    }

    const student = students.find(s => s.studentNum === studentNum);
    console.log('Found student:', student); // Log the student object if found

    if (student) {
        res.render('student', { student });
    } else {
        res.render('student', { message: 'Student not found' });
    }
});






// Example route for /managers (assuming you have this function)
app.get("/managers", (req, res) => {
    collegeData.getManagers()
        .then((managers) => {
            res.json(managers);
        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching managers", error: err });
        });
});



// Route to handle form submission
app.post('/students/add', (req, res) => {
    console.log(req.body); // Log the form data for debugging
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Unable to add student");
        });
});

// Handle 404 - Page Not Found
app.use((req, res) => {
    res.status(404).json({ message: "Page Not THERE, Are you sure of the path?" });
});


// Export app for testing purposes
module.exports = app;
