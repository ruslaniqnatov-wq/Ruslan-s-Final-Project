const API_URL = "http://195.26.245.5:9505/api";

function showRegistrationMessage(message, isError = true) {
    const form = document.querySelector(".form");
    let messageBox = document.getElementById("register-message");

    if (!messageBox) {
        messageBox = document.createElement("p");
        messageBox.id = "register-message";
        messageBox.className = isError ? "login-message" : "register-success";
        messageBox.setAttribute("role", isError ? "alert" : "status");
        form.querySelector("h1").insertAdjacentElement("afterend", messageBox);
    }

    messageBox.className = isError ? "login-message" : "register-success";
    messageBox.setAttribute("role", isError ? "alert" : "status");
    messageBox.textContent = message;
}

async function register(event) {
    event.preventDefault();

    const user = {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        email: document.getElementById("email").value.trim(),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    };
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showRegistrationMessage("");

    try {
        const response = await fetch(`${API_URL}/clients`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });
        const responseText = await response.text();
        let result = {};

        if (responseText.trim()) {
            try {
                result = JSON.parse(responseText);
            } catch {
                result = { message: responseText };
            }
        }

        if (!response.ok) {
            const validationMessages = result.validations
                ?.map((validation) => validation.message)
                .filter(Boolean)
                .join(" ");
            showRegistrationMessage(
                validationMessages || result.message || result.error
                    || `Не удалось зарегистрироваться (ошибка ${response.status}). Проверьте введённые данные.`
            );
            return;
        }

        showRegistrationMessage("Регистрация завершена. Сейчас откроется страница входа.", false);
        window.setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    } catch (error) {
        console.error("Registration request failed:", error);
        if (window.isSecureContext && API_URL.startsWith("http:")) {
            showRegistrationMessage("Браузер заблокировал запрос: сайт открыт по HTTPS, а API использует HTTP. Для регистрации на опубликованном сайте API должен поддерживать HTTPS.");
        } else {
            showRegistrationMessage("Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова.");
        }
    } finally {
        submitButton.disabled = false;
    }
}