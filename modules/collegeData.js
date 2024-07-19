const fs = require('fs');

// Define the Data class
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

// Initialize dataCollection variable
let dataCollection = null;

// Function to initialize data
function initialize() {
    return new Promise((resolve, reject) => {
        // Read students.json file
        fs.readFile('./data/students.json', 'utf8', (err, studentDataFromFile) => {
            if (err) {
                // Reject if unable to read students.json
                reject("Unable to read students.json");
                return;
            }

            // Parse student data from file
            let studentData = JSON.parse(studentDataFromFile);

            // Read courses.json file
            fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
                if (err) {
                    // Reject if unable to read courses.json
                    reject("Unable to read courses.json");
                    return;
                }

                // Parse course data from file
                let courseData = JSON.parse(courseDataFromFile);

                // Create Data object with parsed data
                dataCollection = new Data(studentData, courseData);
                
                // Resolve the promise after initialization
                resolve();
            });
        });
    });
}

// Function to get all students
function getAllStudents() {
    return new Promise((resolve, reject) => {
        // Check if students data exists
        if (dataCollection.students.length > 0) {
            // Resolve with students data
            resolve(dataCollection.students);
        } else {
            // Reject if no students data
            reject("No results returned");
        }
    });
}

// Function to get all courses
function getCourses() {
    return new Promise((resolve, reject) => {
        // Check if courses data exists
        if (dataCollection.courses.length > 0) {
            // Resolve with courses data
            resolve(dataCollection.courses);
        } else {
            // Reject if no courses data
            reject("No results returned");
        }
    });
}

// Function to get students by course
function getStudentsByCourse(course) {
    return new Promise((resolve, reject) => {
        const filteredStudents = dataCollection.students.filter(student => student.course === course);
        if (filteredStudents.length > 0) {
            resolve(filteredStudents);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get a single student by student number
function getStudentByNum(studentNum) {
    return new Promise((resolve, reject) => {
        const student = dataCollection.students.find(student => student.studentNum === studentNum);
        if (student) {
            resolve(student);
        } else {
            reject("No results returned");
        }
    });
}

// Function to get all managers
function getManagers() {
    return new Promise((resolve, reject) => {
        const managers = dataCollection.students.filter(student => student.TA === true);
        if (managers.length > 0) {
            resolve(managers);
        } else {
            reject("No results returned");
        }
    });
}

// Function to add a new student
function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        if (!studentData.TA) {
            studentData.TA = false;
        } else {
            studentData.TA = true;
        }

        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);

        resolve();
    });
}

// Export functions for external use
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, getManagers, addStudent };
