/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Nigan Byanjankar Student ID: 151732237  Date: 2024/07/18
*
********************************************************************************/ 

const express = require('express');
const path = require('path');
const collegeData = require("./modules/collegeData");
const bodyParser = require('body-parser');
const app = express();
const HTTP_PORT = process.env.PORT || 3000//8080;


app.set('views', __dirname + '/views');


// Serve static files from the 'Public' directory
app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.static('Public'));

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
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route for about.html (assuming you create this file)
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route for htmlDemo.html (assuming you create this file)
app.get("/htmlDemo", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'htmldemo.html'));
});

app.get("/students/add", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addStudent.html'));
});

  
  

app.get('/students', (req, res) => {
    collegeData.getAllStudents()
        .then((students) => {
            res.json(students);
        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching students", error: err });
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

// Example route for a single student by student number
app.get("/student/:studentNum", (req, res) => {
    const num = paresInt(req.params.numuh)
    collegeData.getStudentByNum(req.params.studentNum)
        .then((student) => {
            res.json(student);
        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching student", error: err });
        });
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

// Example route for /courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            res.json(courses);
        })
        .catch((err) => {
            res.status(500).json({ message: "Error fetching courses", error: err });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Export app for testing purposes
module.exports = app;
