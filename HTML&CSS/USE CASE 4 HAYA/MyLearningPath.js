async function loadLearningPath() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        console.error("No logged-in user found in localStorage.");
        return;
    }

    console.log(currentUser)

    const completedCourses = currentUser.completedCourses.classId || [];
    const inProgressCourses = currentUser.inProgressCourses.classId || [];
    const pendingCourses = currentUser.pendingCourses || [];

    const completedTable = document.getElementById("completed-courses");
    const inProgressTable = document.getElementById("in-progress-courses");
    const pendingTable = document.getElementById("pending-courses");

    completedTable.innerHTML = "";
    inProgressTable.innerHTML = "";
    pendingTable.innerHTML = "";

    let classesData = JSON.parse(localStorage.getItem("classesData")) || [];
    let coursesData = JSON.parse(localStorage.getItem("coursesData")) || [];

    if (classesData.length === 0 || coursesData.length === 0) {
        console.log("Data not found in localStorage, loading from JSON...");

        classesData = await fetchJson('../utils/classes.json');
        
        coursesData = await fetchJson('../utils/courses.json');

        if (!classesData || !coursesData) {
            console.error("Failed to load data.");
            return;
        }
    }

    populateLearningPath(completedCourses, inProgressCourses, pendingCourses, classesData.classes, coursesData.courses);
}

async function fetchJson(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${file}:`, error);
        return null;
    }
}

function populateLearningPath(completedCourses, inProgressCourses, pendingCourses, classesData, coursesData) {
    const completedTable = document.getElementById("completed-courses");
    const inProgressTable = document.getElementById("in-progress-courses");
    const pendingTable = document.getElementById("pending-courses");

    completedTable.innerHTML = `
        <thead>
            <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Semester</th>
                <th>Grade</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    inProgressTable.innerHTML = `
        <thead>
            <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Semester</th>
                <th>Progress (%)</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    pendingTable.innerHTML = `
        <thead>
            <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Semester</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    function getCourseById(classId) {
        let flag =false
        for (const course of classesData) {
            for (const classItem of course.classes) {
                if (`${classItem.id}` === `${classId}` && classItem.isValidated!==0) {
                    return [course,classItem];
                }
            }
        }
        if(!flag){
            return [];
        }
        return "Unknown Course";
    }

    function getCourseNameByCode(courseCode) {
        const course = coursesData.find(c => c.code === courseCode);
        return course ? course.name : "Unknown Course";
    }

    completedCourses.forEach(crs => {
       
        const data = getCourseById(crs.id);
        if(data.length>0){
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data[0].courseCode}</td>
            <td>${data[0].title}</td>
            <td>${data[1].instructor}</td>
            <td>${data[0].semester}-${data[0].year}</td>
            <td>${crs.grade || "N/A"}</td>
        `;
        completedTable.appendChild(row);
        }
    });

    inProgressCourses.forEach(crs => {
        const data = getCourseById(crs.id);
        if(data.length>0){
            console.log(data)
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data[0].courseCode}</td>
                <td>${data[0].title}</td>
                <td>${data[1].instructor}</td>
                <td>${data[0].semester}-${data[0].year}</td>
                <td>${data[1].progress || "N/A"}</td>
            `;
            inProgressTable.appendChild(row);
        }
    });

    pendingCourses.forEach(courseCode => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${courseCode}</td>
            <td>${getCourseNameByCode(courseCode)}</td>
            <td>N/A</td> 
            <td>N/A</td> 
            <td>Pending</td>
        `;
        pendingTable.appendChild(row);
    });
}
