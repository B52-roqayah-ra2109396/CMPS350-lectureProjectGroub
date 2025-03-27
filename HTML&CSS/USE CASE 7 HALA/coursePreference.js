let selectedCourses = [];

function onLoadAction() {
    loadCourses();
}

async function loadCourses() {
    const courseListContainer = document.getElementById("courseList");
    let publishedCourses = [];
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("User not logged in. Please log in again.");
        window.location.href = "../login.html";
        return;
    }

    let storedData = localStorage.getItem("publishedCourses");
    if (storedData) {
        publishedCourses = JSON.parse(storedData);
    } else {
        try {
            const response = await fetch("../utils/published.json");
            const data = await response.json();
            publishedCourses = data.publishedCourses || [];
        } catch (error) {
            console.error("Error fetching published courses:", error);
            alert("Could not load published courses.");
            return;
        }
    }

    if (publishedCourses.length === 0) {
        courseListContainer.innerHTML = "<p>No courses available at the moment.</p>";
        return;
    }

    const categorizedCourses = {};
    publishedCourses.forEach(course => {
        if (!categorizedCourses[course.category]) {
            categorizedCourses[course.category] = [];
        }
        categorizedCourses[course.category].push(course);
    });

    const currentDate = new Date();
    let coursesHTML = "";

    for (const category in categorizedCourses) {
        coursesHTML += `<div class="category-section">
                            <h2>${category}</h2>
                            <div class="course-cards">`;

        categorizedCourses[category].forEach(course => {
            let deadlineColor = "black";
            let isExpired = false;
            let appliedCourse = null;
            let selected = selectedCourses.some(c => c.courseCode === course.courseCode);

            course.interests.forEach(intr => {
                if (intr.instructorId === currentUser.email) {
                    appliedCourse = intr;
                }
            });

            if (course.deadline) {
                const deadlineDate = new Date(course.deadline);
                if (deadlineDate < currentDate) {
                    deadlineColor = "red";
                    isExpired = true;
                } else {
                    deadlineColor = "green";
                }
            }

          
            let statusText = "";
            let statusColor = "black"; 

            if (appliedCourse) {
                if (appliedCourse.status === "pending") {
                    statusText = "Pending";
                    statusColor = "orange"; 
                } else if (appliedCourse.status === "accepted") {
                    statusText = "Accepted";
                    statusColor = "green"; 
                } else if (appliedCourse.status === "rejected") {
                    statusText = "Rejected";
                    statusColor = "red"; 
                }
            }

            coursesHTML += `
                <div class="course-card">
                    <h3>${course.courseCode} - ${course.courseName}</h3>
                    <h4><strong>Semester:</strong> ${course.semester} - ${course.year}</h4>
                    <p style="color: ${deadlineColor}; border-color: ${deadlineColor};"><strong>Deadline:</strong> ${course.deadline || 'N/A'}</p>`;

            if (appliedCourse) {
                coursesHTML += `<p style="color: ${statusColor}; border-color:${statusColor}"><strong>Status:</strong> ${statusText}</p>`;
            } else if (isExpired) {
                coursesHTML += `<p style="color: red; border-color: red"><strong>Deadline Closed</strong></p>`; 
            } else if (!selected) {
                coursesHTML += `<button class="select-btn" onclick="selectCourse('${course.courseCode}', '${course.courseName}')">Select</button>`;
            }

            coursesHTML += `</div>`; 
        });

        coursesHTML += `</div></div>`; 
    }

    courseListContainer.innerHTML = coursesHTML;
}



function updateSelectedCourses() {
    const selectedPreferencesContainer = document.getElementById("selectedPreferences");
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    let userCourses = selectedCourses.filter(course => course.studentId === currentUser.id);

    selectedPreferencesContainer.innerHTML = userCourses.length === 0 ? 
        "<p>No courses selected yet.</p>" : 
        userCourses.map((course, index) =>`
            <div class="selected-course">
                <span>${index + 1}. ${course.courseCode} - ${course.courseName} (<strong>${course.status}</strong>)</span>
                <button class="remove-btn" onclick="removeCourse('${course.courseCode}')">Remove</button>
            </div>`
        ).join("");
}

function selectCourse(courseCode, courseName) {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("User not logged in. Please log in again.");
        window.location.href = "../login.html";
        return;
    }

    if (selectedCourses.some(course => course.courseCode === courseCode)) {
        alert("You have already selected this course.");
        return;
    }

    selectedCourses.push({ instructorId: currentUser.email,instructorName:currentUser.name, courseCode, courseName, status: "pending" });
    loadCourses(); 
    updateSelectedCourses();
}

function removeCourse(courseCode) {
    selectedCourses = selectedCourses.filter(course => course.courseCode !== courseCode);
    loadCourses();
    updateSelectedCourses();
}

function submitCourse() {
    let storedData = localStorage.getItem("publishedCourses");
    let publishedCourses = storedData ? JSON.parse(storedData) : [];
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("User not logged in. Please log in again.");
        window.location.href = "../login.html";
        return;
    }

    selectedCourses.forEach(selectedCourse => {
        let courseIndex = publishedCourses.findIndex(course => course.courseCode === selectedCourse.courseCode);
        
        if (courseIndex !== -1) {
            let course = publishedCourses[courseIndex];
            
            if (!course.interests) {
                course.interests = [];
            }
            
            let existingInterestIndex = course.interests.findIndex(interest => interest.instructorId === currentUser.email);
            
            if (existingInterestIndex === -1) {
                course.interests.push({
                    instructorId: currentUser.email,
                    instructorName: currentUser.name,
                    status: "Pending"
                });
            }
        }
    });

    // console.log(publishedCourses)
    localStorage.setItem("publishedCourses", JSON.stringify(publishedCourses));
    alert("Your course selections have been submitted successfully.");
    selectedCourses = []
    loadCourses(); 
    updateSelectedCourses();

}
