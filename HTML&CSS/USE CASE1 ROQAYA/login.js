function handleLogin(event) {
    event.preventDefault(); 
    // localStorage.removeItem("classesData");
    // localStorage.removeItem("coursesData")

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const selectedRole = document.querySelector("input[name='role']:checked").value;
    const messageBox = document.querySelector("#message");

    fetch("../utils/users.json")
        .then(response => response.json())
        .then(data => {
            
            const users = data.users;
            const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);
            console.log(selectedRole,user)
            if (user) {
                messageBox.textContent = `Login successful! Welcome, ${selectedRole}.`;
                messageBox.style.color = "green";
                if(user.role === 'Student'){
                    window.location.href = `../USE CASE2 ROQAYA/mainStudent.html`;
                }
                else if(user.role === 'Instructor'){
                    window.location.href = `../USE CASE2 ROQAYA/mainINSTR.html`;
                }
                else if(user.role === 'Administrator'){
                    window.location.href = `../USE CASE2 ROQAYA/mainADMIN.html`;
                }
            } else {
                messageBox.textContent = "Invalid credentials or role mismatch. Please try again.";
                messageBox.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error loading users:", error);
            messageBox.textContent = "Error loading users. Please try again later.";
            messageBox.style.color = "red";
        });
}

