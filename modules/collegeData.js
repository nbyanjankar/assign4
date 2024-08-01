const mongoose = require('mongoose');

// MongoDB URI from environment variables
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

// Define schemas
const collegeSchema = new mongoose.Schema({
    name: String,
    location: String,
});

const studentSchema = new mongoose.Schema({
    studentNum: { type: Number, unique: true },
    firstName: String,
    lastName: String,
    course: Number,
    TA: Boolean,
});

const courseSchema = new mongoose.Schema({
    courseId: { type: Number, unique: true },
    courseCode: String,
    courseDescription: String,
});

// Define models
const College = mongoose.model('College', collegeSchema);
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);

// Initialize MongoDB connection
module.exports.initialize = async function () {
    try {
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Unable to connect to the database", error);
        process.exit(1);
    }
};

// MongoDB functions
module.exports.getAllStudents = async function () {
    try {
        const students = await Student.find();
        if (students.length === 0) throw new Error("No results returned");
        return students;
    } catch (error) {
        throw new Error("Unable to retrieve students: " + error.message);
    }
};

// Mongoose functions for Students
module.exports.getStudentByNum = function (num) {
    return Student.findOne({ studentNum: num });
};

module.exports.getStudentsByCourse = function (courseId) {
    return Student.find({ course: courseId });
};

module.exports.addStudent = function (studentData) {
    studentData.TA = studentData.TA ? true : false;
    Object.keys(studentData).forEach(prop => {
        if (studentData[prop] === "") {
            studentData[prop] = null;
        }
    });
    return Student.create(studentData);
};

module.exports.updateStudent = function (studentData) {
    studentData.TA = studentData.TA ? true : false;
    Object.keys(studentData).forEach(prop => {
        if (studentData[prop] === "") {
            studentData[prop] = null;
        }
    });
    return Student.updateOne({ studentNum: studentData.studentNum }, studentData);
};

module.exports.deleteStudentByNum = function (num) {
    return Student.deleteOne({ studentNum: num });
};

// Mongoose functions for Courses
module.exports.getCourses = function () {
    return Course.find();
};

module.exports.getCourseById = function (id) {
    return Course.findOne({ courseId: id });
};

module.exports.addCourse = function (courseData) {
    Object.keys(courseData).forEach(prop => {
        if (courseData[prop] === "") {
            courseData[prop] = null;
        }
    });
    return Course.create(courseData);
};

module.exports.updateCourse = function (courseData) {
    Object.keys(courseData).forEach(prop => {
        if (courseData[prop] === "") {
            courseData[prop] = null;
        }
    });
    return Course.updateOne({ courseId: courseData.courseId }, courseData);
};

module.exports.deleteCourseById = function (id) {
    return Course.deleteOne({ courseId: id });
};
