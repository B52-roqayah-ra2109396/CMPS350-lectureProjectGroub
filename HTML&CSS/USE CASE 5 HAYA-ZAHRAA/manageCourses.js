
async function onLoadAction(){
    let data;
        const storedData = localStorage.getItem("classesData");
        if (storedData) {
            data = JSON.parse(storedData);
        } else {
            const response = await fetch('../utils/classes.json');
            data = await response.json();
            localStorage.setItem("classesData", JSON.stringify(data));
        }
   await loadInProgressCourses();
   await loadOpenForRegistrationCourses();
}
async function loadInProgressCourses() {
    try {
        const inProgressSection = document.getElementById('InProgressCourses');
       let data;
        const storedData =  localStorage.getItem('classesData');
        if (storedData) {
            data = JSON.parse(storedData);
        } else {
            
            data = []
        
        }

        let categoryMap = {};
        data.classes.forEach(course => {
            let courseContent = '';
            let bgClass = 'blue-bg';

            course.classes.forEach((classInfo, index) => {
                if (classInfo.isValidated === 1) {
                    courseContent += `
                        <div class="class ${bgClass}">
                            <p>Class ${index + 1}: Instructor: ${classInfo.instructor}<br>
                            Time: ${classInfo.time}<br>
                            Students Enrolled: ${classInfo.studentEnrolled}</p>
                        </div>`;
                    bgClass = bgClass === 'blue-bg' ? 'white-bg' : 'blue-bg';
                }
            });

            if (courseContent) {
                if (!categoryMap[course.category]) {
                    categoryMap[course.category] = '';
                }
                categoryMap[course.category] += `
                    <div class="course">
                        <h3>${course.courseCode} - ${course.title}</h3>
                        ${courseContent}
                    </div>`;
            }
        });

        let content = '';
        for (const [category, courses] of Object.entries(categoryMap)) {
            content += `
                <div class="course-category">
                    <h2>${category}</h2>
                    ${courses}
                </div>`;
        }

        inProgressSection.innerHTML = content || '<p>No in-progress courses found.</p>';
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}


async function loadOpenForRegistrationCourses() {
    try {
        
        let data;
        const storedData = localStorage.getItem("classesData");
        if (storedData) {
            data = JSON.parse(storedData);
            console.log(data)
        } else {
            const response = await fetch('../utils/classes.json');
            data = [];
        
        }
        const openSection = document.getElementById('OpenForRegistration');
        let categoryMap = {};
        data.classes.forEach(course => {
            let openClasses = course.classes.filter(cls => cls.isValidated === 0);
            
            if (openClasses.length > 0) {
                if (!categoryMap[course.category]) {
                    categoryMap[course.category] = '';
                }
                
                let courseHtml = `
                    <div class="course">
                        <h3>${course.courseCode} - ${course.title}</h3>
                `;
                openClasses.forEach((cls, idx) => {
                    courseHtml += `
                        <div class="class ${idx % 2 === 0 ? 'blue-bg' : 'white-bg'}">
                            <p>Class ${idx + 1}: Instructor: ${cls.instructor}<br>
                            Time: ${cls.time}<br>
                            Available Seats: ${cls.availableSeats}<br>
                            Students Enrolled: ${cls.studentEnrolled}</p>
                        </div>
                        <div class="button-container">
                            <button class="cancel-btn" onclick="cancelClass('${course.courseCode}', ${idx})">CANCEL</button>
                            <button class="validate-btn" onclick="validateClass('${course.courseCode}', ${idx})">VALIDATE</button>
                        </div>
                    `;
                });
                courseHtml += `</div>`;
                categoryMap[course.category] += courseHtml;
            }
        });

        let finalHtml = '';
        for (const [category, coursesHtml] of Object.entries(categoryMap)) {
            finalHtml += `
                <div class="course-category">
                    <h2>${category}</h2>
                    ${coursesHtml}
                </div>
            `;
        }
        
        openSection.innerHTML = finalHtml || '<p>No courses open for registration found.</p>';
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function validateClass(courseCode, classIndex) {
    let data = JSON.parse(localStorage.getItem("classesData"));
    let course = data.classes.find(c => c.courseCode === courseCode);
    if (!course) return;
    let openClasses = course.classes.filter(cls => cls.isValidated === 0);
    let cls = openClasses[classIndex];
    
    if (cls.studentEnrolled >= 15) {
        cls.isValidated = 1;
        localStorage.setItem("classesData", JSON.stringify(data));
        alert(`Class validated: ${courseCode} - ${cls.instructor}`);
    } else {
        alert("Not enough students enrolled to validate this class.");
        return;
    }
    
    onLoadAction();
}

function cancelClass(courseCode, classIndex) {

    let data = JSON.parse(localStorage.getItem("classesData"));
    let course = data.classes.find(c => c.courseCode === courseCode);
    if (!course) return;

    if (course.studentEnrolled >= 15) {
        alert(`Can't Cancel this course: ${courseCode} - ${cls.instructor}`);
        return;
    } 
    
    let openClasses = course.classes.filter(cls => cls.isValidated === 0);
    let classToRemove = openClasses[classIndex];
    if (!classToRemove) return;
    course.classes = course.classes.filter(cls => !(cls.instructor === classToRemove.instructor && cls.time === classToRemove.time && cls.isValidated === 0));
    
    alert(`Class canceled: ${courseCode}`);
    
localStorage.setItem("classesData", JSON.stringify(data));
   onLoadAction();
}

