const COURSES_JSON_FILE = "../utils/courses.json";
const CLASSES_JSON_FILE = "../utils/classes.json";
const USERS_JSON_FILE = "../utils/users.json";
let coursesData = [];
let classesData = [];
let userData = [];
function onLoadAction() {
  let storedCourses = localStorage.getItem("coursesData");
  let storedClasses = localStorage.getItem("classesData");
  let storedUsers = localStorage.getItem("userData");

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
  } else {
    fetch(CLASSES_JSON_FILE)
      .then((response) => response.json())
      .then((data) => {
        classesData = data;
        localStorage.setItem("classesData", JSON.stringify(data));
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }

  if (storedUsers) {
    userData = JSON.parse(storedUsers).users;
    console.log(userData)
  } else {
    fetch(USERS_JSON_FILE)
      .then((response) => response.json())
      .then((data) => {
        userData = data.users;
        localStorage.setItem("userData", JSON.stringify(data));
        console.log(userData,'read jsons');
        populateInstructorsDropdown();
      })
      .catch((error) => console.error("Error loading user JSON:", error));
  }

    populateInstructorsDropdown();
    populateDropdowns();
}


function populateInstructorsDropdown() {
  let instructorDropdown = document.getElementById("instructor");
  if (!instructorDropdown) {
    console.error("Instructor dropdown not found!");
    return;
  }

  instructorDropdown.innerHTML =
    '<option value="" disabled selected>-</option>';

  let instructors = userData.filter((user) => user.role === "Instructor");

  instructors.forEach((instructor) => {
    let option = document.createElement("option");
    option.value = instructor.email; 
    option.textContent = instructor.name;
    instructorDropdown.appendChild(option);
  });
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
  fillDropdown("courseCategory", categories);
  populatePrerequisiteDropdown();
  populateYearDropdown("year");
  document
    .getElementById("category1")
    ?.addEventListener("change", updateCoursesDropdown);
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
  for (let i = currentYear-5; i <= currentYear + 10; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    dropdown.appendChild(option);
  }
}

function updateCoursesDropdown(event) {
  let selectedCategory = event.target.value;
  let filteredCourses = coursesData.courses.filter(
    (course) => course.category === selectedCategory
  );

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
  let courseCodeInput = document.getElementById("courseCode");
  let courseNameInput = document.getElementById("courseName");
  let categoryInput = document.getElementById("courseCategory");


  let courseCode = courseCodeInput.value.trim();
  let courseName = courseNameInput.value.trim();
  let category = categoryInput.value.trim();

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
  let existingCourse = coursesData.courses.find(
    (course) => course.code === courseCode
  );
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
  courseCodeInput.value = "";
  courseNameInput.value = "";
  categoryInput.value = "";
  populateDropdowns();
}

// 🎯 Class Submission Function
function handleClassSubmission(event) {
  //   event.preventDefault();

  let categoryInput = document.getElementById("category1");
  let courseInput = document.getElementById("course");
//   let instructorInput = document.getElementById("name1");
  let semesterInput = document.getElementById("semester");
  let yearInput = document.getElementById("year");
  let timeInput = document.getElementById("time");
  let seatsInput = document.getElementById("seats1");
  let prerequisitesInput = document.getElementById("prereq");

  let instructorInput = document.getElementById("instructor");
  

  let category = categoryInput.value;
  let course = JSON.parse(courseInput.value);
  let instructor = instructorInput.value;
  let semester = semesterInput.value;
  let year = yearInput.value;
  let time = timeInput.value;
  let seats = seatsInput.value;
  let prerequisites = Array.from(prerequisitesInput.selectedOptions).map(
    (opt) => opt.value
  );

  let selectedInstructor = userData.find(user => user.email === instructor);

  if (prerequisites.includes("None")) {
    prerequisites = [];
  }

  if (
    !category ||
    !course ||
    !instructor ||
    !semester ||
    !year ||
    !time ||
    !seats
  ) {
    alert("Please fill all required fields!");
    return;
  }

  const tim = new Date().getTime(); 
  const randomValue = Math.floor(Math.random() * (200220 - 234 + 1)) + 234;
  let totalClasses = classesData.classes.reduce((count, c) => count + c.classes.length, 0);
  let nextClassId = parseInt(`${totalClasses}${randomValue}`) ;
  console.log(nextClassId)
  let existingCourse = classesData.classes.find(
    (c) =>
      c.courseCode === course.code &&
      c.category === category &&
      c.semester === semester &&
      c.year === year
  );

  if (existingCourse) {
    let sameClass = existingCourse.classes.find(
      (cls) => cls.instructor === instructor && cls.time === time
    );

    if (sameClass) {
      alert("Class with the same instructor and time already exists!");
      return;
    } else {
      existingCourse.classes.push({
        id: nextClassId,
        instructor: selectedInstructor.name,
        availableSeats: parseInt(seats),
        studentEnrolled: 0,
        isValidated: 0,
        prerequisites,
        time,
      });
      localStorage.setItem("classesData", JSON.stringify(classesData));
      alert("New class added under existing course!");
      categoryInput.value = "";
      courseInput.value = "";
      instructorInput.value = "";
      semesterInput.value = "";
      yearInput.value = "";
      timeInput.value = "";
      seatsInput.value = "";
      prerequisitesInput.value = "";
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
        id: nextClassId,
        instructor: selectedInstructor.name,
        availableSeats: parseInt(seats),
        studentEnrolled: 0,
        isValidated: 0,
        prerequisites: prerequisites,
        time: time,
      },
    ],
  };

  classesData.classes.push(newClass);
  console.log(classesData);
  localStorage.setItem("classesData", JSON.stringify(classesData));
  alert("New course and class added successfully!");
  categoryInput.value = "";
  courseInput.value = "";
  instructorInput.value = "";
  semesterInput.value = "";
  yearInput.value = "";
  timeInput.value = "";
  seatsInput.value = "";
  prerequisitesInput.value = "";
}
