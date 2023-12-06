"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");

let type;

class Workout {
  id = (Date.now() + "").slice(-10);
  date = new Date();

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration; //min
  }

  _setDescription() {
    this.type === "running"
      ? (this.description = `Running ${new Intl.DateTimeFormat("pl-PL").format(
          this.date
        )}`)
      : (this.description = `Cycling ${new Intl.DateTimeFormat("pl-PL").format(
          this.date
        )}`);
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.pace = this.duration / this.distance;
    this._setDescription();
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.speed = this.distance / this.duration;
    this._setDescription();
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    this._getWorkoutsFromLocalStorage();

    //Submit new workout
    form.addEventListener("submit", this._newWorkout.bind(this));
    //Toggle climb field
    inputType.addEventListener("change", this._toggleClimbField.bind(this));
    //Center map on click
    containerWorkouts.addEventListener(
      "click",
      this._moveToWorkoutOnMap.bind(this)
    );
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Your position is not reached");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    this.#map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    //load markers from localstorage
    this.#workouts.forEach((workout) => {
      this._displayOnMap(workout);
    });
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleClimbField() {
    inputClimb.closest(".form__row").classList.toggle("form__row--hidden");
    inputTemp.closest(".form__row").classList.toggle("form__row--hidden");
  }

  //a

  _newWorkout(e) {
    e.preventDefault();

    let workout;

    const areNumbers = (...numbers) =>
      numbers.every((elem) => Number.isFinite(elem));

    const areNumbersPositive = (...numbers) =>
      numbers.every((elem) => elem > 0);

    //Coordinates from map event
    const latitude = this.#mapEvent.latlng.lat;
    const longitude = this.#mapEvent.latlng.lng;

    //Get values from form
    type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //Check type of workout
    if (type === "running") {
      const temp = +inputTemp.value;

      //Form validation
      if (
        !areNumbers(distance, duration, temp) ||
        !areNumbersPositive(distance, duration, temp)
      )
        return alert("You type incorrect values1");

      //Create Runing or Cycling obj
      workout = new Running([latitude, longitude], distance, duration, temp);
    }

    if (type === "cycling") {
      const climb = +inputClimb.value;

      //Form validation
      if (
        !areNumbers(distance, duration, climb) ||
        !areNumbersPositive(distance, duration)
      )
        return alert("You type incorrect values2");

      //Create Runing or Cycling obj
      workout = new Cycling([latitude, longitude], distance, duration, climb);
    }

    //Push new obj to workout array
    this.#workouts.push(workout);

    //Display on the map
    this._displayOnMap(workout);

    //Display on the sidebar
    this._displayOnSidebar(workout);

    //Clear form
    inputDistance.blur();
    inputDuration.blur();
    inputClimb.blur();
    inputTemp.blur();
    inputDistance.value =
      inputDuration.value =
      inputClimb.value =
      inputTemp.value =
        "";
    form.classList.add("hidden");

    //refresh localstorage
    this._addWorkoutsToLocalStorage();
  }

  _displayOnMap(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          content:
            `${workout.type === "running" ? "🏃" : "🚵‍♂️"} ` +
            workout.description,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .openPopup();
  }

  _displayOnSidebar(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? "🏃" : "🚵‍♂️"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === "running") {
      html += `<div class="workout__details">
      <span class="workout__icon">📏⏱</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">m/min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">👟⏱</span>
      <span class="workout__value">${workout.temp}</span>
      <span class="workout__unit">step/min</span>
    </div>
    </li>`;
    }

    if (workout.type === "cycling") {
      html += `<div class="workout__details">
      <span class="workout__icon">📏⏱</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🏔</span>
      <span class="workout__value">${workout.climb}</span>
      <span class="workout__unit">m</span>
    </div>
    </li>`;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToWorkoutOnMap(e) {
    const workoutElem = e.target.closest(".workout");
    if (!workoutElem) return;

    const workout = this.#workouts.find(
      (item) => item.id === workoutElem.dataset.id
    );

    this.#map.setView(workout.coords, 13);
  }

  _addWorkoutsToLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _getWorkoutsFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach((workout) => {
      this._displayOnSidebar(workout);
    });
  }

  resetLocalStroge() {
    localStorage.removeItem("workouts");
  }
}

let init = new App();
