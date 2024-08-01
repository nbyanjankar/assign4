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
require('dotenv').config();

const express = require('express');
const path = require('path');
const collegeData = require("./modules/collegeData");
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

const HTTP_PORT = process.env.PORT || 8080; 
const exphbs = require('express-handlebars');

// Setup views and static files
app.set('views', path.join(__dirname, 'Views'));
app.use(express.static(path.join(__dirname, 'Public')));

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
            return lvalue != rvalue ? options.inverse(this) : options.fn(this);
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

// Middleware to set active route for navigation
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Routes for static pages
app.get("/", (req, res) => res.render('home'));
app.get("/about", (req, res) => res.render('about'));
app.get("/htmlDemo", (req, res) => res.render('htmlDemo'));
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then(courses => res.render('addStudent', { courses }))
        .catch(() => res.render('addStudent', { courses: [] }));
});
app.get("/singlestudent", (req, res) => res.render('singlestd'));
app.get("/updatestd", (req, res) => res.render('updatestd'));

// Route for students
app.get("/students", (req, res) => {
    collegeData.getAllStudents()
        .then(students => res.render("students", { students: students.length > 0 ? students : [], message: students.length > 0 ? "" : "No results" }))
        .catch(() => res.status(500).send("Unable to retrieve students"));
});

// Route to add a student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(() => res.status(500).send("Unable to add student"));
});

// Route to view a student
app.get("/student/:studentNum", (req, res) => {
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum)
        .then(student => {
            viewData.student = student || null;
            return collegeData.getCourses();
        })
        .then(courses => {
            viewData.courses = courses;
            if (viewData.student) {
                viewData.courses.forEach(course => {
                    if (course.courseId == viewData.student.course) {
                        course.selected = true;
                    }
                });
            }
            res.render("student", { viewData });
        })
        .catch(() => res.status(404).send("Student Not Found"));
});

// Route to update a student
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(() => res.status(500).send("Unable to update student"));
});

// Route to delete a student
app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => res.redirect("/students"))
        .catch(() => res.status(500).send("Unable to Remove Student / Student not found"));
});

// Route for courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(courses => res.render("courses", { courses: courses.length > 0 ? courses : [], message: courses.length > 0 ? "" : "No results" }))
        .catch(() => res.status(500).send("Unable to retrieve courses"));
});

// Route to add a course
app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch(() => res.status(500).send("Unable to add course"));
});

// Route to view a course
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(course => res.render("course", { course: course || null }))
        .catch(() => res.status(500).send("Unable to retrieve course"));
});

// Route to update a course
app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => res.redirect("/courses"))
        .catch(() => res.status(500).send("Unable to update course"));
});

// Route to delete a course
app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => res.redirect("/courses"))
        .catch(() => res.status(500).send("Unable to Remove Course / Course not found"));
});

// Example route for /studentscourse
app.get("/studentscourse", (req, res) => {
    const course = req.query.course;
    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(students => res.json(students))
            .catch(err => res.status(500).json({ message: "Error fetching students by course", error: err }));
    } else {
        collegeData.getAllStudents()
            .then(students => res.json(students))
            .catch(err => res.status(500).json({ message: "Error fetching students", error: err }));
    }
});

// Handle 404 - Page Not Found
app.use((req, res) => {
    res.status(404).json({ message: "Page Not Found" });
});

// Export app for testing purposes
module.exports = app;
