async function loadData() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let classesData = JSON.parse(localStorage.getItem("classesData"));
    let usersData = JSON.parse(localStorage.getItem("userData"));

    console.log("Current User:", currentUser);
    
    if (!classesData) {
        classesData = await fetchJSON("../utils/classes.json");
        if (classesData) {
            localStorage.setItem("classesData", JSON.stringify(classesData));
        }
    }
    
    if (!usersData) {
        usersData = await fetchJSON("../utils/users.json");
        if (usersData) {
            localStorage.setItem("userData", JSON.stringify(usersData));
        }
    }
    
    console.log("Loaded Data:", classesData, usersData);
    return { currentUser, classesData, usersData };
}

async function fetchJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${file}:`, error);
        return null;
    }
}

async function onLoadAction() {
    const { currentUser, classesData, usersData } = await loadData();
    
    if (!currentUser) {
        alert("No user is logged in.");
        return;
    }

    const classDropdown = document.getElementById("class");
    const studentTable = document.querySelector(".GradesForm table");
    populateYearDropdown();
    classDropdown.addEventListener("change", function () {
        displayStudents(this.value, usersData, studentTable);
    });
}

function populateYearDropdown() {
    const yearDropdown = document.getElementById("year");
    const currentYear = new Date().getFullYear();
    
    for (let i = currentYear + 5; i >= currentYear - 5; i--) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        
        if (i === currentYear) {
            option.selected = true; 
        }

        yearDropdown.appendChild(option);
    }
}


async function filterCourses() {
    const semester = document.getElementById("semester").value;
    const year = document.getElementById("year").value;
    const classDropdown = document.getElementById("class");

    const { currentUser, classesData, usersData } = await loadData();

    classDropdown.innerHTML = "<option value=''>Select Course</option>";

    if (!semester || !year) return;

    let filteredClasses = classesData.classes.filter(cls => cls.semester === semester && cls.year == year);
    console.log(filteredClasses)
    populateClassDropdown(currentUser, filteredClasses, classDropdown);
   
}

function populateClassDropdown(user, filteredClasses, dropdown) {
    dropdown.innerHTML = "<option value=''>Select Class</option>";

    const allCourses = [...(user.inProgressCourses || []), ...(user.completedCourses || [])];
    console.log(user)

    allCourses.forEach(courseId => {
        filteredClasses.forEach(courseData => {
            courseData.classes.forEach(cls => {
                if (cls.id === courseId && cls.isValidated!=0) {
                    const option = document.createElement("option");
                    option.value = cls.id;
                    option.textContent = `${courseData.courseCode} - ${courseData.title} (${cls.isValidated === 2 ? "Graded" : "In Progress"})`;
                    dropdown.appendChild(option);
                }
            });
        });
    });
}


function displayStudents(classId, usersData, table) {
    table.innerHTML = `
        <tr>
            <th>S.No</th>
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Grade</th>
        </tr>
    `;

    if (!classId) return;

    let filteredUsers = usersData.users.filter(user => user.role === 'Student');
    let i = 1;

    const isCompletedClass = checkIfCompletedClass(classId);

    filteredUsers.forEach(student => {
        const course = [...(student.inProgressCourses.classId || []), ...(student.completedCourses.classId || [])]
            .find(course => `${course.id}` == `${classId}`);

        if (course) {
            const row = document.createElement("tr");

            const gradeCell = isCompletedClass
                ? `<td>${course.grade || "N/A"}</td>`
                : `<td>${createGradeDropdown(course.grade || "")}</td>`;

            row.innerHTML = `
                <td>${i}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                ${gradeCell}
            `;
            i++;
            table.appendChild(row);
        }
    });

    // disable submit if class is completed
    document.getElementById("submitBtn").disabled = isCompletedClass;
}

function checkIfCompletedClass(classId) {
    const classesData = JSON.parse(localStorage.getItem("classesData"));
    for (let course of classesData.classes) {
        for (let cls of course.classes) {
            if (`${cls.id}` == `${classId}`) {
                return cls.isValidated === 2;
            }
        }
    }
    return false;
}


function createGradeDropdown(selectedGrade) {
    const grades = ["A+", "A", "B+", "B", "C+", "C", "F"];
    let dropdown = `<select>`;

    grades.forEach(grade => {
        dropdown += `<option value="${grade}" ${selectedGrade === grade ? "selected" : ""}>${grade}</option>`;
    });

    dropdown += `</select>`;
    return dropdown;
}



function getStudentGrade(student, classId) {
    const allCourses = [...(student.inProgressCourses || []), ...(student.completedCourses || [])];
    const course = allCourses.find(course => `${course.id}` == `${classId}`);
    return course ? course.grade || "" : "";
}


async function submitGrades() {
    const classId = document.getElementById("class").value;
    if (!classId) return;

    const studentTable = document.querySelector(".GradesForm table");
    let usersData = JSON.parse(localStorage.getItem("userData"));
    let classesData = JSON.parse(localStorage.getItem("classesData"));
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    for (let course of classesData.classes) {
        for (let cls of course.classes) {
            if (`${cls.id}` == `${classId}`) {
                cls.isValidated = 2;
            }
        }
    }

    const index = currentUser.inProgressCourses.indexOf(classId);
    if (index !== -1) {
        currentUser.inProgressCourses.splice(index, 1);
        currentUser.completedCourses.push(classId);
    }

    const rows = document.querySelectorAll(".GradesForm table tr");
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        const studentEmail = cells[2].textContent;
        const gradeSelect = cells[3].querySelector("select");
        const grade = gradeSelect ? gradeSelect.value : null;

        let student = usersData.users.find(u => u.email === studentEmail);
        if (!student) continue;

        student.inProgressCourses.classId = student.inProgressCourses.classId.filter(c => `${c.id}` != `${classId}`);

        student.completedCourses.classId.push({ id: `${classId}`, grade: grade });
    }

    localStorage.setItem("userData", JSON.stringify(usersData));
    localStorage.setItem("classesData", JSON.stringify(classesData));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    alert("Grades submitted and course marked as completed.");
   displayStudents(classId,usersData,studentTable)
    
}
