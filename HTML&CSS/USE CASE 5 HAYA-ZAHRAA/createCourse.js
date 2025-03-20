const COURSES_JSON_FILE = "../utils/courses.json";
const CLASSES_JSON_FILE = "../utils/classes.json";
let coursesData = [];
let classesData = [];
function onLoadAction() {
    let storedCourses = localStorage.getItem("coursesData");
    let storedClasses = localStorage.getItem("classesData");

    if (storedCourses) {
        coursesData = JSON.parse(storedCourses);
    } else {
        fetch(COURSES_JSON_FILE)
            .then((response) => response.json())
            .then((data) => {
                coursesData = data;
                localStorage.setItem("coursesData", JSON.stringify(data));
                populateDropdowns();
            })
            .catch((error) => console.error("Error loading JSON:", error));
    }

    if (storedClasses) {
        classesData = JSON.parse(storedClasses);
    }
    else {
        fetch(CLASSES_JSON_FILE)
            .then((response) => response.json())
            .then((data) => {
                classesData = data;
                localStorage.setItem("classesData", JSON.stringify(data));
            })
            .catch((error) => console.error("Error loading JSON:", error));
    }

    populateDropdowns();
    //   document.getElementById("classForm")?.addEventListener("onclick", handleClassSubmission);
    //   document.getElementById("courseForm")?.addEventListener("submit", handleCourseSubmission);
}

function populateDropdowns() {
    if (!coursesData.courses.length) {
        console.error("Courses data is empty!");
        return;
    }

    let categories = [];
    for (let course of coursesData.courses) {
        if (!categories.includes(course.category)) {
            categories.push(course.category);
        }
    }

    fillDropdown("category1", categories);
    populatePrerequisiteDropdown();
    populateYearDropdown("year");
    document.getElementById("category1")?.addEventListener("change", updateCoursesDropdown);
}

function fillDropdown(dropdownId, items) {
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Dropdown ID '${dropdownId}' not found!`);
        return;
    }

    dropdown.innerHTML = '<option value="" disabled selected>-</option>';
    items.forEach((item) => {
        let option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

function fillCourseDropdown(dropdownId, items) {
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Dropdown ID '${dropdownId}' not found!`);
        return;
    }

    dropdown.innerHTML = '<option value="" disabled selected>-</option>';
    items.forEach((item) => {
        let option = document.createElement("option");
        option.value = JSON.stringify(item);
        option.textContent = item.name;
        dropdown.appendChild(option);
    });
}

function populateYearDropdown(dropdownId) {
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Dropdown ID '${dropdownId}' not found!`);
        return;
    }

    dropdown.innerHTML = '<option value="" disabled selected>-</option>';
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 10; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        dropdown.appendChild(option);
    }
}

function updateCoursesDropdown(event) {
    let selectedCategory = event.target.value;
    let filteredCourses = coursesData.courses
        .filter((course) => course.category === selectedCategory)

    let courseDropdownId = event.target.id === "category1" ? "course" : "prereq";
    fillCourseDropdown(courseDropdownId, filteredCourses);
}

function populatePrerequisiteDropdown() {
    let prereqDropdown = document.getElementById("prereq");

    if (!prereqDropdown) {
        console.error("Prerequisite dropdown not found!");
        return;
    }

    prereqDropdown.innerHTML = "";
    let option = document.createElement("option");
    option.value = "None";
    option.textContent = "None";
    prereqDropdown.appendChild(option);

    coursesData.courses.forEach((course) => {
        let option = document.createElement("option");
        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;
        prereqDropdown.appendChild(option);
    });

    prereqDropdown.setAttribute("multiple", "multiple");
}

// 🎯 Course Submission Function
function handleCourseSubmission(event) {
    //   event.preventDefault();

    let courseCode = document.getElementById("courseCode").value.trim();
    let courseName = document.getElementById("courseName").value.trim();
    let category = document.getElementById("courseCategory").value.trim();

    if (!courseCode || !courseName || !category) {
        alert("Please fill in all fields!");
        return;
    }
    let storedCourses = localStorage.getItem("coursesData");

    if (storedCourses) {
        coursesData = JSON.parse(storedCourses);
    } else {
        fetch(COURSES_JSON_FILE)
            .then((response) => response.json())
            .then((data) => {
                coursesData = data.courses;
                localStorage.setItem("coursesData", JSON.stringify(data));
                populateDropdowns();
            })
            .catch((error) => console.error("Error loading JSON:", error));
    }
    let existingCourse = coursesData.courses.find((course) => course.code === courseCode);
    if (existingCourse) {
        alert("Course with this code already exists!");
        return;
    }

    let newCourse = {
        code: courseCode,
        name: courseName,
        category: category,
    };

    coursesData.courses.push(newCourse);
    localStorage.setItem("coursesData", JSON.stringify(coursesData));

    alert("Course added successfully!");
    populateDropdowns(); // Refresh dropdowns to include the new course
}

// 🎯 Class Submission Function
function handleClassSubmission(event) {
    //   event.preventDefault();

    let category = document.getElementById("category1").value;
    let course = JSON.parse(document.getElementById("course").value);
    let instructor = document.getElementById("name1").value;
    let semester = document.getElementById("semester").value;
    let year = document.getElementById("year").value;
    let time = document.getElementById("time").value;
    let seats = document.getElementById("seats1").value;
    let prerequisites = Array.from(document.getElementById("prereq").selectedOptions).map((opt) => opt.value);
    if (prerequisites.includes('None')) {
        prerequisites = []
    }

    if (!category || !course || !instructor || !semester || !year || !time || !seats) {
        alert("Please fill all required fields!");
        return;
    }
   
    let storedClasses = localStorage.getItem("classesData");

    if (storedClasses) {
        classesData = JSON.parse(storedClasses);
    }
    else {
        fetch(CLASSES_JSON_FILE)
            .then((response) => response.json())
            .then((data) => {
                classesData = data.classes;
                localStorage.setItem("classesData", JSON.stringify(data));
            })
            .catch((error) => console.error("Error loading JSON:", error));
    }
    let existingCourse = classesData.classes.find((c) => c.courseCode === course.code && c.category === category && c.semester === semester && c.year === year);
    
    if (existingCourse) {
        let sameClass = existingCourse.classes.find((cls) => cls.instructor === instructor && cls.time === time);

        if (sameClass) {
            alert("Class with the same instructor and time already exists!");
            return;
        } else {
            existingCourse.classes.push({ instructor, availableSeats: parseInt(seats), studentEnrolled: 0, isValidated: 0, prerequisites, time });
            localStorage.setItem("classesData", JSON.stringify(classesData));
            alert("New class added under existing course!");
            return;
        }
    }

    let newClass = {
        courseCode: course.code,
        title: course.name,
        category: category,
        semester: semester,
        year: year,
        classes: [
            {
                instructor: instructor,
                availableSeats: parseInt(seats),
                studentEnrolled: 0,
                isValidated: 0,
                prerequisites: prerequisites,
                time: time,
            }
        ]
    };

    classesData.classes.push(newClass);
    console.log(classesData);
    localStorage.setItem("classesData", JSON.stringify(classesData));
    alert("New course and class added successfully!");
}
