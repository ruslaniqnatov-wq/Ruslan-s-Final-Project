const API_URL = "http://195.26.245.5:9505/api";
const productsBox = document.getElementById("products");
const surpriseButton = document.getElementById("surprise-product");
const productsStatus = document.getElementById("products-status");

let homeProducts = [];
let showingSurpriseProduct = false;

async function loadProducts() {
  if (!productsBox) return;

  productsBox.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(API_URL + "/products");
    if (!response.ok) {
      throw new Error(`Не удалось загрузить товары: ${response.status}`);
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error("Сервер вернул некорректный список товаров.");
    }

    homeProducts = products.filter((product) => product && typeof product === "object");
    renderHomeProducts();
    surpriseButton.disabled = homeProducts.length === 0;
  } catch (error) {
    console.error("Ошибка загрузки товаров на главной:", error);
    const message = location.protocol === "https:" && new URL(API_URL).protocol === "http:"
      ? "Каталог недоступен: HTTPS-сайт не может безопасно подключиться к HTTP-серверу. Для этого API нужен HTTPS или защищённый серверный прокси."
      : "Не удалось загрузить товары. Проверь подключение к интернету и попробуй ещё раз.";
    const fallback = document.createElement("p");
    fallback.className = "catalog-message";
    fallback.textContent = message;
    productsBox.replaceChildren(fallback);
    surpriseButton.disabled = true;
  } finally {
    productsBox.removeAttribute("aria-busy");
  }
}

function renderHomeProducts() {
  const selectedProducts = showingSurpriseProduct
    ? [homeProducts[Math.floor(Math.random() * homeProducts.length)]].filter(Boolean)
    : homeProducts.slice(0, 4);
  productsBox.replaceChildren(...selectedProducts.map(productCard));
}

function productCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  const image = document.createElement("img");
  image.className = "card_img";
  image.alt = `${product.brand || ""} ${product.model || ""}`.trim();
  image.loading = "lazy";
  if (product.imageUrl) image.src = product.imageUrl;

  const title = document.createElement("h3");
  title.className = "card_title";
  title.textContent = image.alt || "Товар";

  const price = document.createElement("p");
  price.className = "card_price";
  const numericPrice = Number(product.price);
  price.textContent = Number.isFinite(numericPrice)
    ? `${numericPrice.toFixed(2)} AZN`
    : "Цена уточняется";

  card.append(image, title, price);
  return card;
}

surpriseButton.addEventListener("click", () => {
  if (homeProducts.length === 0) return;

  showingSurpriseProduct = !showingSurpriseProduct;
  surpriseButton.textContent = showingSurpriseProduct ? "Показать популярное" : "✨ Удиви меня";
  surpriseButton.setAttribute("aria-pressed", String(showingSurpriseProduct));
  renderHomeProducts();

  if (showingSurpriseProduct) {
    const product = productsBox.querySelector(".card_title");
    productsStatus.textContent = product
      ? `Случайный выбор: ${product.textContent}.`
      : "Случайный товар выбран.";
  } else {
    productsStatus.textContent = "Снова показаны популярные товары.";
  }
});

loadProducts();
