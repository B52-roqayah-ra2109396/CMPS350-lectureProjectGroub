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

function populateClassDropdown(user, classesData, dropdown) {
    dropdown.innerHTML = "<option value=''>Select Class</option>";
    
    if (!user.inProgressCourses || !Array.isArray(user.inProgressCourses)) return;
    
    user.inProgressCourses.forEach(course => {
        classesData.forEach(courseData => {
            courseData.classes.forEach(cls => {
                if (cls.id === course) {
                    const option = document.createElement("option");
                    option.value = cls.id;
                    option.textContent = `${courseData.courseCode} - ${courseData.title}`;
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
    console.log(classId, usersData, table);

    let filteredUsers = usersData.users.filter(user => user.role === 'Student');
    let i = 1;
    filteredUsers.forEach(student => {
        if (student.inProgressCourses.classId.some(course => course.id == classId)) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${i}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${createGradeDropdown(getStudentGrade(student, classId))}</td>
            `;
            i++;
            table.appendChild(row);
        }
    });
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
    const course = student.inProgressCourses.classId.find(course => course.id == classId);
    return course ? course.grade || "" : "";
}