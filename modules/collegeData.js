const fs = require('fs');
const Sequelize = require('sequelize'); 
// Define the Data class
class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}


var sequelize = new Sequelize('d9l196jiarclhd', 'nbyanjnakar', 'zenbZENB@13', {
    host: 'postgresql://postgres.xzemciuixsktebyqmiwe:zenbZENB%4013@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
}); 

var Student = sequelize.define(
    "Student",
    {
      studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true, // automatically increment the value
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      email: Sequelize.STRING,
      addressStreet: Sequelize.STRING,
      addressCity: Sequelize.STRING,
      addressProvince: Sequelize.STRING,
      TA: Sequelize.BOOLEAN,
      status: Sequelize.STRING,
    },
    {
      createdAt: false, // disable createdAt
      updatedAt: false, // disable updatedAt
    },
  );

  var Course = sequelize.define(
    "Course",
    {
      courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true, // automatically increment the value
      },
      courseCode: Sequelize.STRING,
      courseDescription: Sequelize.STRING,
    },
    {
      createdAt: false, // disable createdAt
      updatedAt: false, // disable updatedAt
    },
  );
  Course.hasMany(Student, { foreignKey: "course" });


module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch((err) => reject("unable to sync the database"));
    });
};


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


module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
      Course.findAll({
        where: { courseId: id }
      }).then((data) => {
        resolve(data[0]);
      }).catch(() => {
        reject("no results returned");
      });
    });
  };
  

function cleanObject(obj) {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (obj[prop] == "") {
        obj[prop] = null;
      }
    });
  }

// Function to get all students
module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    Student.findAll().then((data) => {
      resolve(data);
    }).catch(() => {
      reject("no results returned");
    });
  });
};

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
      Course.findAll().then((data) => {
        resolve(data);
      }).catch(() => {
        reject("no results returned");
      });
    });
  };
  
// Function to get all courses
module.exports.getStudentsByCourse = function (course) {
    return new Promise((resolve, reject) => {
      Student.findAll({
        where: { course: course }
      }).then((data) => {
        resolve(data);
      }).catch(() => {
        reject("no results returned");
      });
    });
  };
  

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
module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
      Student.findAll({
        where: { studentNum: num }
      }).then((data) => {
        resolve(data[0]);
      }).catch(() => {
        reject("no results returned");
      });
    });
  };
  
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
module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
      if (studentData[prop] === "") {
        studentData[prop] = null;
      }
    }
    return new Promise((resolve, reject) => {
      Student.update(studentData, {
        where: { studentNum: studentData.studentNum }
      }).then(() => {
        resolve();
      }).catch(() => {
        reject("unable to update student");
      });
    });
  };
  
// Function to add a new student
module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
      if (studentData[prop] === "") {
        studentData[prop] = null;
      }
    }
    return new Promise((resolve, reject) => {
      Student.create(studentData).then(() => {
        resolve();
      }).catch(() => {
        reject("unable to create student");
      });
    });
  };
  

// Export functions for external use
module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, getManagers, addStudent };
