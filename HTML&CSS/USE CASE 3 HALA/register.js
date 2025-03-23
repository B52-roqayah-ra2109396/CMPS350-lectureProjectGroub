function onLoadAction() {
  filterCourses();
}

function displayCourses(courses) {
  const courseList = document.getElementById("course-list");
  courseList.innerHTML = "";
  courses.forEach((course) => {
    const unvalidatedClasses = course.classes.filter(
      (cls) => cls.isValidated === 0
    );
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
                  Instructor: ${
                    cls.instructor
                  } | Available Seats: ${availableSeats} | 
                  Prerequisites: ${
                    cls.prerequisites.length > 0
                      ? cls.prerequisites.join(", ")
                      : "N/A"
                  } | 
                  Time: ${cls.time}
              `;

      const registerBtn = document.createElement("a");
      registerBtn.href = "#";
      registerBtn.classList.add("register-btn");
      registerBtn.textContent = "REGISTER";

      classDiv.appendChild(classInfo);
      classDiv.appendChild(registerBtn);
      courseDiv.appendChild(classDiv);
    });

    courseList.appendChild(courseDiv);
  });
}

function filterCourses() {
  const courseName = document.querySelector("input[name='courseName']");
  const courseCategory = document.querySelector("input[name='courseCategory']");
  const courseTitle = courseName.value.trim().toLowerCase();
  const category = courseCategory.value.trim().toLowerCase();

  function applyFilter(courses) {
    const filteredCourses = courses.filter((course) => {
      let matchesName = true;
      let matchesCategory = true;

      if (courseTitle !== "") {
        matchesName = course.title.toLowerCase().includes(courseTitle);
      }
      if (category !== "") {
        matchesCategory = course.category.toLowerCase().includes(category);
      }

      return (
        matchesName &&
        matchesCategory &&
        course.classes.some((cls) => cls.isValidated === 0)
      );
    });
    displayCourses(filteredCourses);
  }

  const storedData = localStorage.getItem("classesData");
  if (storedData) {
    applyFilter(JSON.parse(storedData).classes);
  } else {
    fetch("../utils/classes.json")
      .then((response) => response.json())
      .then((data) => applyFilter(data.classes))
      .catch((error) => console.error("Error loading courses:", error));
  }
}
