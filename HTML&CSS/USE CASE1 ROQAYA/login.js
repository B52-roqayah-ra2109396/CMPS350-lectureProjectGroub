
// localStorage.removeItem("classesData");
// localStorage.removeItem("coursesData")
// localStorage.removeItem("publishedCourses");
// alert("data cleared")


function handleLogin(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const selectedRole = document.querySelector("input[name='role']:checked").value;
    const messageBox = document.querySelector("#message");

    let usersData = localStorage.getItem("usersData");
    if (usersData) {
        usersData = JSON.parse(usersData);
        processLogin(usersData);
    } else {
        fetch("../utils/users.json")
            .then(response => response.json())
            .then(data => {
                // localStorage.setItem("usersData", JSON.stringify(data.users)); // Cache users
                processLogin(data.users);
            })
            .catch(error => {
                console.error("Error loading users:", error);
                messageBox.textContent = "Error loading users. Please try again later.";
                messageBox.style.color = "red";
            });
    }

    function processLogin(users) {
        const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);

        if (user) {
            messageBox.textContent = `Login successful! Welcome, ${selectedRole}.`;
            messageBox.style.color = "green";

            localStorage.setItem("currentUser", JSON.stringify(user));

            const roleRedirect = {
                "Student": "../USE CASE2 ROQAYA/mainStudent.html",
                "Instructor": "../USE CASE2 ROQAYA/mainINSTR.html",
                "Administrator": "../USE CASE2 ROQAYA/mainADMIN.html"
            };
            window.location.href = roleRedirect[user.role];
        } else {
            messageBox.textContent = "Invalid credentials or role mismatch. Please try again.";
            messageBox.style.color = "red";
        }
    }
}

function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../login.html"; 
}
