function onLoadAction() {
  ensureDataLoaded();
  filterCourses();
}

function ensureDataLoaded() {
  if (!localStorage.getItem("userData")) {
    fetch("../utils/users.json")
      .then((response) => response.json())
      .then((data) => saveUserData(data.users))
      .catch((error) => console.error("Error loading users:", error));
  }

  if (!localStorage.getItem("classesData")) {
    fetch("../utils/classes.json")
      .then((response) => response.json())
      .then((data) => {
        saveClassesData(data.classes);
        applyFilter(data.classes);
      })
      .catch((error) => console.error("Error loading courses:", error));
  } else {
    applyFilter(JSON.parse(localStorage.getItem("classesData")).classes);
  }
}

function getCurrentUser() {
  const userData = localStorage.getItem("userData");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (userData && currentUser) {
    const users = JSON.parse(userData).users;
    let user = users.find((user) => user.email === currentUser.email) || null;
    console.log(users,currentUser)
    return user;
  }
  return null;
}

function saveUserData(users) {
  localStorage.setItem("userData", JSON.stringify({ users }));
}

function saveClassesData(classes) {
  localStorage.setItem("classesData", JSON.stringify({ classes }));
}

function registerCourse(classId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("User not found. Please log in.");
    return;
  }

  const storedData = localStorage.getItem("classesData");
  if (!storedData) {
    alert("Course data not available.");
    return;
  }

  let classesData = JSON.parse(storedData).classes;

  let cls;
  let courseCode;
  let prerequisites = [];

  for (let course of classesData) {
    cls = course.classes.find((c) => `${c.id}` === `${classId}`);
    if (cls) {
      courseCode = course.courseCode;
      prerequisites = cls.prerequisites || [];
      break;
    }
  }

  if (!cls) {
    alert("Class not found.");
    return;
  }

  // Get all classIds associated with the courseCode
  const courseClassIds =
    classesData.find((course) => course.courseCode === courseCode)?.classes.map((cls) => cls.id) ||
    [];

  // Ensure correct access to completed and in-progress courses by checking courseCode
  if (
    currentUser.completedCourses.classId.some((c) => courseClassIds.includes(c.id)) ||
    currentUser.inProgressCourses.classId.some((c) => courseClassIds.includes(c.id))
  ) {
    alert("You have already completed or are currently enrolled in this course.");
    return;
  }

  // 🔍 Check prerequisite completion
  const completedCourseCodes = currentUser.completedCourses.classId
    .map((c) => {
      for (let course of classesData) {
        if (course.classes.some((cls) => cls.id === c.id)) {
          return course.courseCode;
        }
      }
      return null;
    })
    .filter(Boolean);

  const missingPrerequisites = prerequisites.filter((code) => !completedCourseCodes.includes(code));

  if (missingPrerequisites.length > 0) {
    alert(
      `Cannot register. Missing prerequisites: ${missingPrerequisites.join(", ")}`
    );
    return;
  }

  if (cls.availableSeats - cls.studentEnrolled <= 0) {
    alert("No available seats for this class.");
    return;
  }

  cls.studentEnrolled += 1;
  currentUser.inProgressCourses.classId.push({ id: classId,  grade: "" });
  currentUser.pendingCourses = currentUser.pendingCourses.filter((c) => c !== courseCode);

  const usersData = JSON.parse(localStorage.getItem("userData"));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  const userIndex = usersData.users.findIndex((u) => u.email === currentUser.email);
  usersData.users[userIndex] = currentUser;
  saveUserData(usersData.users);
  saveClassesData(classesData);

  alert("You have successfully registered for the course.");
  filterCourses();
}

function displayCourses(courses) {
  const currentUser = getCurrentUser();
  const courseList = document.getElementById("course-list");
  courseList.innerHTML = "";

  courses.forEach((course) => {
    const unvalidatedClasses = course.classes.filter((cls) => cls.isValidated === 0);
    if (unvalidatedClasses.length === 0) return;

    const courseDiv = document.createElement("div");
    courseDiv.classList.add("course");

    const title = document.createElement("h3");
    title.textContent = `${course.courseCode} - ${course.title}`;
    courseDiv.appendChild(title);

    unvalidatedClasses.forEach((cls) => {
      const classDiv = document.createElement("div");
      classDiv.classList.add("instructor-class");

      const availableSeats = cls.availableSeats - cls.studentEnrolled;
      const classInfo = document.createElement("span");
      classInfo.innerHTML = `
        Instructor: ${cls.instructor} | Available Seats: ${availableSeats} | 
        Prerequisites: ${cls.prerequisites.length > 0 ? cls.prerequisites.join(", ") : "N/A"} | 
        Time: ${cls.time}
      `;

      const registerBtn = document.createElement("a");
      registerBtn.href = "#";
      registerBtn.classList.add("register-btn");
      registerBtn.textContent = "REGISTER";
      registerBtn.onclick = () => registerCourse(cls.id);

      const courseClassIds =
    courses.find((crs) => crs.courseCode === course.courseCode)?.classes.map((cls) => cls.id) ||
    [];

      // const courseClassIds = course.classes.map((c) => c.id);
      const isAlreadyEnrolled =
        currentUser &&
        (currentUser.completedCourses.classId.some((c) => courseClassIds.includes(c.id)) ||
          currentUser.inProgressCourses.classId.some((c) => courseClassIds.includes(c.id)));
      
      if (isAlreadyEnrolled) {
        registerBtn.classList.add("disabled");
        registerBtn.textContent = "ALREADY REGISTERED";
        registerBtn.onclick = null;
      }

      classDiv.appendChild(classInfo);
      classDiv.appendChild(registerBtn);
      courseDiv.appendChild(classDiv);
    });

    courseList.appendChild(courseDiv);
  });
}



function filterCourses() {
  const storedData = localStorage.getItem("classesData");
  if (!storedData) {
    fetch("../utils/classes.json")
      .then((response) => response.json())
      .then((data) => {
        saveClassesData(data.classes);
        applyFilter(data.classes);
      })
      .catch((error) => console.error("Error loading courses:", error));
  } else {
    applyFilter(JSON.parse(storedData).classes);
  }
}

function applyFilter(courses) {
  const courseTitle = document
    .querySelector("input[name='courseName']")
    .value.trim()
    .toLowerCase();
  const category = document
    .querySelector("input[name='courseCategory']")
    .value.trim()
    .toLowerCase();

  const filteredCourses = courses.filter((course) => {
    let matchesName =
      courseTitle === "" || course.title.toLowerCase().includes(courseTitle);
    let matchesCategory =
      category === "" || course.category.toLowerCase().includes(category);

    return (
      matchesName &&
      matchesCategory &&
      course.classes.some((cls) => cls.isValidated === 0)
    );
  });

  displayCourses(filteredCourses);
}
