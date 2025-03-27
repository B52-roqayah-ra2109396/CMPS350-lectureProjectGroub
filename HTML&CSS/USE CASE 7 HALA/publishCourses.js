function onLoadAction(){
    loadCoursesForCheckboxes();
    populateYearDropdown("year");
}

async function loadCoursesForCheckboxes() {
    let coursesData;
    const stored = localStorage.getItem("coursesData");
    if (stored) {
        coursesData = JSON.parse(stored).courses;
    } else {
        try {
            const response = await fetch("../utils/courses.json");
            const data = await response.json();
            coursesData = data.courses;
            localStorage.setItem("coursesData", JSON.stringify(data));
        } catch (error) {
            console.error("Error fetching courses:", error);
            return;
        }
    }
    
    let categoryMap = {};
    coursesData.forEach(course => {
        if (!categoryMap[course.category]) {
            categoryMap[course.category] = [];
        }
        categoryMap[course.category].push(course);
    });
    
    let html = '<h3>Select Courses to Publish:</h3>';
    for (let category in categoryMap) {
        let categoryId = category.replace(/\s+/g, '');
        html += `<div id="${categoryId}">`;
        html += `<h4>${category}</h4>`;
        categoryMap[category].forEach(course => {
            html += `<label>\n` +
                    `<input type="checkbox" name="${course.code.toLowerCase()}" value='${JSON.stringify(course)}'> ` +
                    `${course.code} ${course.name}\n</label><br>\n`;
        });
        html += `</div>`;
    }
    document.getElementById("checkboxContainer").innerHTML = html;
}

function populateYearDropdown(dropdownId) {
    let dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Dropdown ID '${dropdownId}' not found!`);
        return;
    }
    let currentYear = new Date().getFullYear();
    let options = '<option value="" disabled selected>-</option>';
    for (let i = currentYear; i <= currentYear + 10; i++) {
        options += `<option value="${i}">${i}</option>`;
    }
    dropdown.innerHTML = options;
}


document.getElementById("form-data").addEventListener("submit", function(event) {
    event.preventDefault();
    publishCourses();
});

async function publishCourses() {
    let selectedCourses = document.querySelectorAll("input[type='checkbox']:checked");
    let semester = document.getElementById("semester").value;
    let year = document.getElementById("year").value;
    let deadline = document.getElementById("deadline").value;

    if (selectedCourses.length === 0) {
        alert("Please select at least one course to publish.");
        return;
    }

    if (!semester || !year || !deadline) {
        alert("Please select semester, year, and deadline before publishing.");
        return;
    }

    let publishedCourses = [];

    let storedData = localStorage.getItem("publishedCourses");
    if (storedData) {
        publishedCourses = JSON.parse(storedData);
    } else {
        try {
            const response = await fetch("../utils/published.json"); 
            const data = await response.json();
            publishedCourses = data.publishedCourses || [];
            localStorage.setItem("publishedCourses", JSON.stringify(publishedCourses));
        } catch (error) {
            console.error("Error fetching published courses:", error);
            alert("Could not load published courses. Please try again.");
            return;
        }
    }

    let currentDate = new Date();

    selectedCourses.forEach(course => {
        let courseData = JSON.parse(course.value)
        let courseCode =   courseData.code;
        let courseName = courseData.name;
        let courseCategory = courseData.category;
        let existingCourse = publishedCourses.find(c => c.courseCode === courseCode && c.year == year && c.semester == semester);
        if (existingCourse && new Date(existingCourse.deadline) >= currentDate) {
            alert(`Course ${courseCode} is already published for ${semester} ${year} and is still valid.`);
            return;
        } else {
            publishedCourses.push({
                courseCode: courseCode,
                courseName: courseName,
                category: courseCategory,
                semester: semester,
                year: parseInt(year),
                deadline: deadline,
                interests: []
            });
        }
    });

    console.log(publishedCourses)
    localStorage.setItem("publishedCourses", JSON.stringify(publishedCourses));
    alert("Courses published successfully!");
    document.querySelectorAll("input[type='checkbox']:checked").forEach(checkbox => {
        checkbox.checked = false;
    });

    document.getElementById("semester").value = "";
    document.getElementById("year").value = "";
    document.getElementById("deadline").value = "";
}
