function create_new_user() {
    const login = document.getElementById("login-input").value;
    const password_1 = document.getElementById("password-input").value;
    const password_2 = document.getElementById("second-password-input").value;

    if (password_1 === password_2) {
        const newUser = {
            name: login,
            login: login,
            password: password_1,
            role: "waiter"
        };

        fetch("http://localhost:3456/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        })
            .then((response) => response.json())
            .then(() => {
                window.location.href = `http://localhost:3456/signin`;
            })
            .catch((error) => {
                console.error("Ошибка при создании пользователя.", error);
            });
    } else {
        alert("Пароли не совпадают");
    }
}

function login_user() {
    const login = document.getElementById("login-input").value;
    const password_1 = document.getElementById("password-input").value;

    const tryUser = {
        login: login,
        password: password_1
    }

    fetch("http://localhost:3456/signin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(tryUser),
    })
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error("Ошибка при запросе.");
            }
        })
        .then(() => {
            window.location.href = `http://localhost:3456/`;
        })
        .catch((error) => {
            alert("Неверный логин или пароль.");
            document.getElementById("login-input").value = "";
            document.getElementById("password-input").value = "";
        });


}
