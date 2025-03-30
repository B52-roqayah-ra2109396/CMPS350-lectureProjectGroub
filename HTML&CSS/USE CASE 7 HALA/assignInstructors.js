const COURSES_JSON_FILE = "../utils/courses.json";
const CLASSES_JSON_FILE = "../utils/classes.json";
let coursesData = [];
let classesData = [];
let publishedCourses = [];

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
  loadCourses()
    .then(displayCourses)
    .catch((error) => console.error("Error loading courses:", error));
}

async function loadCourses() {
  let coursesData = localStorage.getItem("publishedCourses");

  if (coursesData) {
    return JSON.parse(coursesData);
  } else {
    try {
      const response = await fetch("../utils/published.json");
      if (!response.ok) throw new Error("Failed to load JSON file");
      const jsonData = await response.json();
      localStorage.setItem(
        "publishedCourses",
        JSON.stringify(jsonData.publishedCourses)
      );
      return jsonData.publishedCourses;
    } catch (error) {
      return [];
    }
  }
}

function displayCourses(courses) {
  const container = document.querySelector(".course-grid");
  container.innerHTML = "";

  courses.forEach((course) => {
    course.interests
      .filter(
        (instructor) =>
          !instructor.status || instructor.status.toLowerCase() === "pending"
      )
      .forEach((instructor) => {
        const courseCard = document.createElement("div");
        courseCard.classList.add("course-card");
        courseCard.innerHTML = `
                    <h3>${instructor.instructorName}</h3>
                    <p><strong>${course.courseCode}</strong><br>${course.courseName}</p>
                    <p><strong>Semester:</strong> ${course.semester} - ${course.year}</p>
                    <div class="buttons">
                        <button class="accept" onclick="updateInstructorStatus('${course.courseCode}', '${instructor.instructorId}', 'accepted', '${course.semester}', '${course.year}')">Accept</button>
                        <button class="decline" onclick="updateInstructorStatus('${course.courseCode}', '${instructor.instructorId}', 'declined', '${course.semester}', '${course.year}')">Decline</button>
                    </div>
                `;
        container.appendChild(courseCard);
      });
  });
}

function updateInstructorStatus(
  courseCode,
  instructorId,
  newStatus,
  semester,
  year
) {
  publishCourses = JSON.parse(localStorage.getItem("publishedCourses"));

  let course = publishCourses.find(
    (c) =>
      c.courseCode === courseCode &&
      c.semester === semester &&
      `${c.year}` === `${year}`
  );
  let instr = null;
  let flag = false;
  if (course) {
    course.interests.forEach((instructor) => {
      if (instructor.instructorId === instructorId) {
        instructor.status = newStatus;
        if (newStatus === "accepted") {
          instructor.status = "accepted";
          instr = instructor;
          flag = true;
        } else {
          instructor.status = "rejected";
        }
      } else if (newStatus === "accepted") {
        instructor.status = "rejected";
      }
    });
    console.log(course);
    displayCourses(publishCourses);
    if (flag) {
      populatePrerequisiteDropdown();
      showClassForm(course, instr);
    }
  }
}

function showClassForm(course, instructor) {
  console.log(course);
  document.getElementById("hiddenForm").style.display = "block";

  let categoryField = document.getElementById("category1");
  categoryField.innerHTML = `<option value="${course.category}" selected>${course.category}</option>`;
  categoryField.disabled = true;
  let courseField = document.getElementById("course");
  courseField.innerHTML = `<option value='${JSON.stringify(course)}' selected>${
    course.courseCode
  } - ${course.courseName}</option>`;
  courseField.disabled = true;

  let instructorField = document.getElementById("name1");
  instructorField.value = instructor.instructorName;
  instructorField.disabled = true;

  let semesterField = document.getElementById("semester");
  semesterField.value = course.semester;
  semesterField.disabled = true;

  let yearField = document.getElementById("year");
  yearField.innerHTML = `<option value="${course.year}" selected>${course.year}</option>`;
  yearField.disabled = true;
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

function handleClassSubmission(event) {
  //   event.preventDefault();

  let categoryInput = document.getElementById("category1");
  let courseInput = document.getElementById("course");
  let instructorInput = document.getElementById("name1");
  let semesterInput = document.getElementById("semester");
  let yearInput = document.getElementById("year");
  let timeInput = document.getElementById("time");
  let seatsInput = document.getElementById("seats1");
  let prerequisitesInput = document.getElementById("prereq");

  let category = categoryInput.value;
  console.log(courseInput.value);
  let course = JSON.parse(courseInput.value);
  console.log(course);
  let instructor = instructorInput.value;
  let semester = semesterInput.value;
  let year = yearInput.value;
  let time = timeInput.value;
  let seats = seatsInput.value;
  let prerequisites = Array.from(prerequisitesInput.selectedOptions).map(
    (opt) => opt.value
  );
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
  let totalClasses = classesData.classes.reduce((count, c) => count + c.classes.length, 0);
  let nextClassId = totalClasses + 1;
  
  let existingCourse = classesData.classes.find(
    (c) =>
      c.courseCode === course.courseCode &&
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
        instructor,
        availableSeats: parseInt(seats),
        studentEnrolled: 0,
        isValidated: 0,
        prerequisites,
        time,
      });
      localStorage.setItem("classesData", JSON.stringify(classesData));
      console.log(publishedCourses);
      localStorage.setItem(
        "publishedCourses",
        JSON.stringify(publishedCourses)
      );
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
    courseCode: course.courseCode,
    title: course.courseName,
    category: category,
    semester: semester,
    year: year,
    classes: [
      {
        id: nextClassId,
        instructor: instructor,
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
  console.log(publishedCourses);
  localStorage.setItem("publishedCourses", JSON.stringify(publishedCourses));
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
