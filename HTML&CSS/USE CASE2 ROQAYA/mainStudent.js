function onLoadAction() {
  filterCourses();
}

function displayCourses(courses) {
  const coursesContainer = document.getElementById("courses-container");

  coursesContainer.innerHTML = "";
  if (courses.length === 0) {
    coursesContainer.innerHTML = "<p>No courses found.</p>";
    return;
  }
  courses.forEach((course) => {
    const courseDiv = document.createElement("div");
    courseDiv.classList.add("course");
    courseDiv.innerHTML = `<span class="course-title">${course.code}</span><br>${course.name}`;
    coursesContainer.appendChild(courseDiv);
  });
}

function filterCourses() {
  const courseName = document.querySelector("input[name='courseName']").value.trim().toLowerCase();
  const courseCategory = document.querySelector("input[name='courseCategory']").value.trim().toLowerCase();

  let storedCourses = localStorage.getItem("coursesData")||null;

  if (storedCourses) {
    let courses = JSON.parse(storedCourses);
    applyFilter(courses.courses, courseName, courseCategory);
  } else {
    fetch("../utils/courses.json")
      .then((response) => response.json())
      .then((data) => {
        let courses = data.courses;
        localStorage.setItem("coursesData", JSON.stringify(data)); 
        applyFilter(courses, courseName, courseCategory);
      })
      .catch((error) => console.error("Error loading courses:", error));
  }
}

function applyFilter(courses, courseTitle, category) {
  if (courseTitle === "" && category === "") {
    displayCourses(courses);
    return;
  }

  const filteredCourses = courses.filter((course) => {
    const matchesName = courseTitle ? course.name.toLowerCase().includes(courseTitle) : true;
    const matchesCategory = category ? course.category.toLowerCase().includes(category) : true;
    return matchesName && matchesCategory;
  });

  displayCourses(filteredCourses);
}
