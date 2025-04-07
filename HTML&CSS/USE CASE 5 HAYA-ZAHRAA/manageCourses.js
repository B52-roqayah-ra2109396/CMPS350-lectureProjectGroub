let userData = [];
async function onLoadAction() {
  let data;
  let storedUsers = localStorage.getItem("userData");
  const storedData = localStorage.getItem("classesData");
  if (storedData) {
    data = JSON.parse(storedData);
  } else {
    const response = await fetch("../utils/classes.json");
    data = await response.json();
    localStorage.setItem("classesData", JSON.stringify(data));
  }
  if (storedUsers) {
    userData = JSON.parse(storedUsers);
    
  } else {
    fetch("../utils/users.json")
      .then((response) => response.json())
      .then((data) => {
        userData = data;
        localStorage.setItem("userData", JSON.stringify(data));
      })
      .catch((error) => console.error("Error loading user JSON:", error));
  }
  await loadInProgressCourses();
  await loadOpenForRegistrationCourses();
}

async function loadInProgressCourses() {
  try {
    const inProgressSection = document.getElementById("InProgressCourses");
    let data;
    const storedData = localStorage.getItem("classesData");
    if (storedData) {
      data = JSON.parse(storedData);
    } else {
      data = [];
    }

    let categoryMap = {};
    let categoryOrder = [];

    data.classes.forEach((course) => {
      if (!categoryMap[course.category]) {
        categoryMap[course.category] = [];
        categoryOrder.push(course.category);
      }
      categoryMap[course.category].push(course);
    });

    categoryOrder.forEach((category) => {
      categoryMap[category].sort((a, b) =>
        a.courseCode.localeCompare(b.courseCode)
      );
    });

    let content = "";
    categoryOrder.forEach((category) => {
      let coursesContent = "";
      categoryMap[category].forEach((course) => {
        let courseContent = "";
        let bgClass = "blue-bg";

        course.classes.forEach((classInfo, index) => {
          if (classInfo.isValidated === 1) {
            courseContent += `
                            <div class="class ${bgClass}">
                                <p>Class ${index + 1}: Instructor: ${
              classInfo.instructor
            }<br>
                                Time: ${classInfo.time}<br>
                                Students Enrolled: ${
                                  classInfo.studentEnrolled
                                }</p>
                            </div>`;
            bgClass = bgClass === "blue-bg" ? "white-bg" : "blue-bg";
          }
        });

        if (courseContent) {
          coursesContent += `
                        <div class="course">
                            <h3>${course.courseCode} - ${course.title}</h3>
                            <p><strong>Semester:</strong> ${course.semester} ${course.year}</p>
                            ${courseContent}
                        </div>`;
        }
      });
      if (coursesContent) {
        content += `
                    <div class="course-category">
                        <h2>${category}</h2>
                        ${coursesContent}
                    </div>`;
      }
    });

    inProgressSection.innerHTML =
      content || "<p>No in-progress courses found.</p>";
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

async function loadOpenForRegistrationCourses() {
  try {
    let data;
    const storedData = localStorage.getItem("classesData");
    if (storedData) {
      data = JSON.parse(storedData);
    } else {
      const response = await fetch("../utils/classes.json");
      data = [];
    }

    const openSection = document.getElementById("OpenForRegistration");
    let categoryMap = {};
    let categoryOrder = [];

    data.classes.forEach((course) => {
      if (!categoryMap[course.category]) {
        categoryMap[course.category] = [];
        categoryOrder.push(course.category);
      }
      categoryMap[course.category].push(course);
    });

    categoryOrder.forEach((category) => {
      categoryMap[category].sort((a, b) =>
        a.courseCode.localeCompare(b.courseCode)
      );
    });

    let finalHtml = "";
    categoryOrder.forEach((category) => {
      let coursesHtml = "";
      categoryMap[category].forEach((course) => {
        let openClasses = course.classes.filter((cls) => cls.isValidated === 0);

        if (openClasses.length > 0) {
          let courseHtml = `
                        <div class="course">
                            <h3>${course.courseCode} - ${course.title}</h3>
                            <p><strong>Semester:</strong> ${course.semester} ${course.year}</p>
                    `;

          openClasses.forEach((cls, idx) => {
            courseHtml += `
                            <div class="class ${
                              idx % 2 === 0 ? "blue-bg" : "white-bg"
                            }">
                                <p>Class ${idx + 1}: Instructor: ${
              cls.instructor
            }<br>
                                Time: ${cls.time}<br>
                                Available Seats: ${cls.availableSeats}<br>
                                Students Enrolled: ${cls.studentEnrolled}</p>
                            </div>
                            <div class="button-container">
                                <button class="cancel-btn" onclick="cancelClass('${
                                  course.courseCode
                                }', '${course.semester}', '${course.year}', ${
              cls.id
            })">CANCEL</button>
                                <button class="validate-btn" onclick="validateClass('${
                                  course.courseCode
                                }', '${cls.id}','${course.semester}','${
              course.year
            }')">VALIDATE</button>
                            </div>
                        `;
          });
          courseHtml += `</div>`;
          coursesHtml += courseHtml;
        }
      });
      if (coursesHtml) {
        finalHtml += `
                    <div class="course-category">
                        <h2>${category}</h2>
                        ${coursesHtml}
                    </div>
                `;
      }
    });

    openSection.innerHTML =
      finalHtml || "<p>No courses open for registration found.</p>";
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

function validateClass(courseCode, classId, semester, year) {
  let storedClasses = localStorage.getItem("classesData");

  let classesData = JSON.parse(storedClasses);

  let course = classesData.classes.find(
    (c) =>
      c.courseCode === courseCode && c.semester === semester && c.year === year
  );
  if (!course) {
    alert("Error: Course not found!");
    return;
  }

  let classToValidate = course.classes.find((cls) => `${cls.id}` === `${classId}`);
  if (!classToValidate) {
    alert("Error: Class not found!");
    return;
  }

  if (classToValidate.studentEnrolled >= 15) {
    classToValidate.isValidated = 1;
  } else {
    alert("Not enough students enrolled to validate this class.");
    return;
  }

  let instructor = userData.users.find(
    (user) =>
      user.role === "Instructor" &&
      user.name.trim() === classToValidate.instructor
  );
  if (!instructor) {
    alert("Error: Instructor not found!");
    return;
  }

  if (!instructor.inProgressCourses) {
    instructor.inProgressCourses = [];
  }

  if (!instructor.inProgressCourses.includes(classId)) {
    instructor.inProgressCourses.push(classId);
  }

  localStorage.setItem("classesData", JSON.stringify(classesData));
  localStorage.setItem("userData", JSON.stringify(userData));

  alert(`Class ${classId} validated successfully! Instructor updated.`);

  onLoadAction();
}

function cancelClass(courseCode, semester, year, classIndex) {
  let data = JSON.parse(localStorage.getItem("classesData"));
  let course = data.classes.find((c) =>c.courseCode === courseCode && c.semester === semester && c.year === year);

  
  if (!course) return;


  userData.users.forEach((user)=>{
    if(user.role==="Student")
    user.inProgressCourses.classId = user.inProgressCourses.classId.filter((cls)=>cls.id!=classIndex);
  })
  userData.users.forEach((user)=>{
    if(user.role==="Student" && !user.pendingCourses.includes(courseCode)){
      user.pendingCourses.push(courseCode)
    }
  })

  console.log(userData)


  let classToRemove = course.classes.find((cls) => `${cls.id}` === `${classIndex}`);

  course.classes = course.classes.filter((cls) =>!(cls.id === classIndex ));


  alert(`Class canceled: ${courseCode} - ${classToRemove.instructor} (${semester} ${year})`);
  localStorage.setItem("userData", JSON.stringify(userData));
  localStorage.setItem("classesData", JSON.stringify(data));
  onLoadAction();
}
