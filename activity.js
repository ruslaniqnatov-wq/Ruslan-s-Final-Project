(() => {
    const ACTIVITY_API_URL = "https://fakerestapi.azurewebsites.net/api/v1/Activities";
    const prompt = document.getElementById("activity-prompt");
    const meta = document.getElementById("activity-meta");
    const status = document.getElementById("activity-status");
    const nextButton = document.getElementById("activity-next");

    if (!prompt || !meta || !status || !nextButton) return;

    let activities = [];
    let currentActivityId = null;

    function showActivity(activity) {
        currentActivityId = activity.id;
        prompt.textContent = activity.title || `Задание ${activity.id}`;

        const dueDate = new Date(activity.dueDate);
        meta.textContent = Number.isNaN(dueDate.getTime())
            ? `Задание ${activity.id}`
            : `Задание ${activity.id} · ${dueDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long"
            })}`;

        status.textContent = activity.completed
            ? "Это задание уже отмечено как выполненное."
            : "Выбери идею и устрой короткую паузу.";
    }

    function showNextActivity() {
        const options = activities.filter((activity) => activity.id !== currentActivityId);
        const pool = options.length ? options : activities;
        const nextActivity = pool[Math.floor(Math.random() * pool.length)];
        if (nextActivity) showActivity(nextActivity);
    }

    async function loadActivities() {
        nextButton.disabled = true;
        status.textContent = "Подключаемся к FakeREST API...";

        try {
            const response = await fetch(ACTIVITY_API_URL);
            if (!response.ok) {
                throw new Error(`Activities API вернул ошибку ${response.status}.`);
            }

            const result = await response.json();
            if (!Array.isArray(result) || result.length === 0) {
                throw new Error("Activities API вернул пустой или некорректный список.");
            }

            activities = result.filter((activity) =>
                activity && Number.isFinite(Number(activity.id)) && typeof activity.title === "string"
            );
            if (activities.length === 0) {
                throw new Error("В ответе Activities API нет заданий с корректными идентификаторами.");
            }

            showNextActivity();
            nextButton.disabled = false;
        } catch (error) {
            console.error("Не удалось загрузить идеи из FakeREST API:", error);
            prompt.textContent = "Не удалось загрузить идею.";
            meta.textContent = "";
            status.textContent = "Проверь подключение к интернету и попробуй ещё раз.";
        }
    }

    nextButton.addEventListener("click", showNextActivity);
    loadActivities();
})();
