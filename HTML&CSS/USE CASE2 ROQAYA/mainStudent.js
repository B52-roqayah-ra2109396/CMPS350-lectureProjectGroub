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
  const courseName = document.querySelector("input[name='courseName']");
  const courseCategory = document.querySelector(
    "input[name='courseCategory']"
  );
  let courses = [];
  fetch("../utils/courses.json")
    .then((response) => response.json())
    .then((data) => {
      courses = data.courses;
      const courseTitle = courseName.value.trim().toLowerCase();
      const category = courseCategory.value.trim().toLowerCase();
      if (courseTitle === "" && category === "") {
        displayCourses(courses);
        return;
      }
      const filteredCourses = courses.filter((course) => {
        const matchesName = courseTitle
          ? course.name.toLowerCase().includes(courseTitle)
          : true;
        const matchesCategory = category
          ? course.category.toLowerCase().includes(category)
          : true;
        return matchesName && matchesCategory;
      });

      displayCourses(filteredCourses);
    })
    .catch((error) => console.error("Error loading courses:", error));
}
