const getId = (Id) => {return document.getElementById(Id)};

const sourcebtn = getId('get-weather-btn');
const cityInput = getId('city-input');
const weatherResult = getId('weather-result');

const errorModal = getId('error-modal');
const errorMessage = getId('error-message');
const closeModalBtn = getId('close-modal-btn');

const historyList = getId('history-list');
const historyContainer = getId('history-container');

let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];

function renderHistory() {
    if (searchHistory.length === 0) {
        historyContainer.style.display = 'none';
        return;
    }

    historyContainer.style.display = 'block';
    historyList.innerHTML = '';

    searchHistory.forEach(city => {
        const span = document.createElement('span');
        span.classList.add('history-item');
        span.textContent = city;
        
        span.addEventListener('click', () => {
            cityInput.value = city;
            getWeather();
        });

        historyList.appendChild(span);
    });
}

function saveToHistory(city) {
    searchHistory = searchHistory.filter(c => c.toLowerCase() !== city.toLowerCase());
    
    searchHistory.unshift(city);

    if (searchHistory.length > 7) {
        searchHistory.pop();
    }

    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    renderHistory();
}

renderHistory();

function showError(text) {
    errorMessage.textContent = text;
    errorModal.showModal();
}

closeModalBtn.addEventListener('click', () => {
    errorModal.close();
});

async function getWeather() {
    getId('name-city').textContent = ''
    getId('temperature').textContent = ''
    getId('description').textContent = ''
    getId('weather-icon').src = ''
    getId('weather-icon').style.display = 'none'
    getId('weather-result').style.display = 'none'
    let valueInputSity = cityInput.value.trim()
    sourcebtn.textContent = 'Загрузка...'
    sourcebtn.disabled = true

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${valueInputSity}&appid=9a02780a25e2ea4b6cf0a11f1fb8d789&units=metric&lang=ru`

    try {
        if (valueInputSity === "") {
        showError("Напишите название города")
        return
        }
        let response = await fetch(url)
        let data = await response.json()

        if (data.cod !== 200) {
            showError(`Город не найден: ${valueInputSity}`)
            return
        }

        getId('weather-result').style.display = 'flex'

        console.log(data)

        let temp = Math.round(data.main.temp)
        let description = data.weather[0].description
        let city = data.name
        let iconCode = data.weather[0].icon
        let feelsLike = Math.round(data.main.feels_like)
        let humidity  = data.main.humidity
        let windSpeed = data.wind.speed      
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

        const iconImg = getId('weather-icon')
        iconImg.src = iconUrl
        iconImg.style.display = 'block'

        saveToHistory(city);

        getId('name-city').textContent = `📍 ${city}`

        if (temp > 15) {
            getId('temperature').textContent = `🌡 ${temp}°C — лучше выйти погулять`
        } else {
            getId('temperature').textContent = `🌡 ${temp}°C — лучше остаться дома`
        }
        getId('feels-like').textContent = `Но чуствуется как ${feelsLike}°C`

        if (description.toLowerCase() === "пасмурно") {
            getId('description').textContent = `${description} — лучше не выходить`
        } else {
            getId('description').textContent = description
        }
        getId('humidity').textContent = `Относительная влажность воздуха равна ${humidity}%`
        getId('wind-speed').textContent = `Скорость ветра примерна ровна ${windSpeed} м/с`
    } catch (error) {
        showError(`Ошибка запроса: ${error}`)
    } finally {
    sourcebtn.textContent = 'Узнать погоду'
    sourcebtn.disabled = false
}
}

sourcebtn.addEventListener('click', getWeather)
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") getWeather();
});