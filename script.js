"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputTemp = document.querySelector(".form__input--temp");
const inputClimb = document.querySelector(".form__input--climb");

let map;
let mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      map = L.map("map").setView([latitude, longitude], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      map.on("click", function (e) {
        mapEvent = e;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    function () {
      alert("Your position is not reached");
    }
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  L.marker([mapEvent.latlng.lat, mapEvent.latlng.lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        content: "test",
        autoClose: false,
        closeOnClick: false,
        className: "running-popup",
      })
    )
    .openPopup();

  inputCadence.blur();
  inputDistance.blur();
  inputDuration.blur();
  inputClimb.blur();
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputClimb.value =
      "";
  form.classList.add("hidden");
});

inputType.addEventListener("change", function () {
  inputClimb.closest(".form__row").classList.toggle("form__row--hidden");
  inputTemp.closest(".form__row").classList.toggle("form__row--hidden");
});
