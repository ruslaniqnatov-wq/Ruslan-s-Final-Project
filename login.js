
const API_URL = "http://195.26.245.5:9505/api";

function showLoginMessage(message) {
    const form = document.querySelector(".form");
    let messageBox = document.getElementById("login-message");

    if (!messageBox) {
        messageBox = document.createElement("p");
        messageBox.id = "login-message";
        messageBox.className = "login-message";
        messageBox.setAttribute("role", "alert");
        messageBox.setAttribute("aria-live", "assertive");
        form.querySelector("h1").insertAdjacentElement("afterend", messageBox);
    }

    messageBox.textContent = message;
}

async function login(event) {
    event.preventDefault();

    const user = {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Signing in…";
    showLoginMessage("");

    try {
        const response = await fetch(API_URL + "/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const responseText = await response.text();
        let result = {};

        if (responseText.trim()) {
            try {
                result = JSON.parse(responseText);
            } catch (error) {
                if (response.ok) {
                    throw new Error("Сервер вернул некорректный ответ. Попробуйте позже.");
                }
                result = { message: responseText };
            }
        }

        if (!response.ok) {
            const serverMessage = result.message || result.error || result.body?.message;
            showLoginMessage(serverMessage || `Не удалось войти (ошибка ${response.status}). Проверьте логин и пароль.`);
            return;
        }

        const token = result.body?.token || result.token;
        if (!token) {
            console.error("Login response did not contain a token:", result);
            showLoginMessage("Сервер не вернул токен входа. Попробуйте позже.");
            return;
        }

        localStorage.setItem("token", token);
        window.location.href = "index.html";

    } catch (error) {
        console.error("Login request failed:", error);
        showLoginMessage(error.message || "Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "login";
    }
}
