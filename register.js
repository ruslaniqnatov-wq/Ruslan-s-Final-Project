const API_URL = "http://195.26.245.5:9505/api"

function showRegistrationError(message) {
    let messageBox = document.getElementById("register-error")
    if (!messageBox) {
        messageBox = document.createElement("p")
        messageBox.id = "register-error"
        messageBox.className = "login-message"
        messageBox.setAttribute("role", "alert")
        document.querySelector(".form h1").insertAdjacentElement("afterend", messageBox)
    }
    messageBox.textContent = message
}

async function register(event) {
    event.preventDefault()

    const user = {
        name: document.getElementById("name").value.trim(),
        surname: document.getElementById("surname").value.trim(),
        email: document.getElementById("email").value.trim(),
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
    }

    const form = event.currentTarget
    const submitButton = form.querySelector('button[type="submit"]')
    submitButton.disabled = true
    document.getElementById("register-error")?.remove()

    try {
        const response = await fetch(API_URL + "/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        })
        const responseText = await response.text()
        let result = {}

        if (responseText.trim()) {
            try {
                result = JSON.parse(responseText)
            } catch {
                result = { message: responseText }
            }
        }

        if (!response.ok) {
            const validationMessages = result.validations
                ?.map((validation) => validation.message)
                .filter(Boolean)
                .join(" ")
            showRegistrationError(
                validationMessages || result.message || result.error
                    || `Не удалось зарегистрироваться (ошибка ${response.status}). Проверьте введённые данные.`
            )
            return
        }

        alert("Готово! Теперь войдите.")
        window.location.href = "login.html"
    } catch (error) {
        console.error("Registration request failed:", error)
        const message = window.isSecureContext && API_URL.startsWith("http:")
            ? "Браузер заблокировал запрос: сайт открыт по HTTPS, а API использует HTTP."
            : "Не удалось подключиться к серверу. Проверьте соединение и попробуйте снова."
        showRegistrationError(message)
    } finally {
        submitButton.disabled = false
    }
}
