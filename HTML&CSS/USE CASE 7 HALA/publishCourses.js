document.addEventListener("DOMContentLoaded", function() {
    loadCoursesForCheckboxes();
    populateYearDropdown("year");
});

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
                    `<input type="checkbox" name="${course.code.toLowerCase()}" value="${course.code}"> ` +
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
