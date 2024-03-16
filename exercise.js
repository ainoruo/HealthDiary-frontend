import "./style.css";
import { fetchData } from "./fetch.js";
import { showToast } from "./toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  menuToggle.addEventListener("click", function () {
    menu.classList.toggle("show");
  });
});

const form = document.getElementById("exercise-form");
form.addEventListener("submit", submitForm);

const editModal = document.getElementById("edit-modal");
const closeButton = document.querySelector(".close-button");
const editForm = document.getElementById("edit-form");

closeButton.onclick = () => (editModal.style.display = "none");
window.onclick = (event) => {
  if (event.target === editModal) {
    editModal.style.display = "none";
  }
};

async function submitForm(event) {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("User ID not found. Please log in again.");
    return;
  }

  const formData = new FormData(form);
  const exerciseData = {};
  formData.forEach((value, key) => {
    exerciseData[key] = value;
  });
  console.log(exerciseData);

  exerciseData.user_id = userId;

  try {
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/exercise/${userId}`;
    const token = localStorage.getItem("token");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(exerciseData),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Failed to add exercise");
    }

    form.reset();
    showToast("Exercise added successfully!");
  } catch (error) {
    console.error("Error adding exercise:", error.message);
    showToast("Failed to add exercise. Please try again.");
  }
}

const trainingButton = document.querySelector("#fetch-data");
trainingButton.addEventListener("click", fetchExerciseData);

async function fetchExerciseData() {
  const userId = localStorage.getItem("user_id");
  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/exercise/${userId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  fetchData(url, options).then((data) => {
    createTable(data);
  });
}

function createTable(data) {
  console.log(data);

  const tbody = document.querySelector(".tbody");
  tbody.innerHTML = "";

  data.forEach((element) => {
    console.log(
      element.date,
      element.type,
      element.duration,
      element.intensity
    );

    const tr = document.createElement("tr");

    const formattedDate = new Date(element.date).toLocaleDateString("fi-FI");

    const td1 = document.createElement("td");
    td1.innerText = formattedDate;

    const td2 = document.createElement("td");
    td2.innerText = element.type;

    const td3 = document.createElement("td");
    td3.innerText = element.duration;

    const td4 = document.createElement("td");
    td4.innerText = element.intensity;

    const td5 = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.setAttribute("exercise-id", element.exercise_id);
    editButton.setAttribute("data-exercise-id", element.exercise_id);
    editButton.innerText = "Edit";
    editButton.addEventListener("click", (evt) => openEditModal(evt, data));
    td5.appendChild(editButton);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);

    tbody.appendChild(tr);
  });

  document
    .querySelectorAll(".edit")
    .forEach((button) =>
      button.addEventListener("click", (evt) => openEditModal(evt, data))
    );
}

function openEditModal(evt, data) {
  const exerciseId = parseInt(evt.target.dataset.exerciseId, 10);
  console.log("Entry ID:", exerciseId);
  const entryData = data.find((entry) => entry.exercise_id === exerciseId);

  document.getElementById("edit-entry-id").value = exerciseId;
  document.getElementById("edit-date").value = entryData.date;
  document.getElementById("edit-type").value = entryData.type;
  document.getElementById("edit-duration").value = entryData.duration;
  document.getElementById("edit-intensity").value = entryData.intensity;

  editModal.style.display = "block";
}
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const exerciseId = formData.get("edit-entry-id");

  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/exercise/${exerciseId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: formData.get("edit-date"),
      type: formData.get("edit-type"),
      duration: formData.get("edit-duration"),
      intensity: formData.get("edit-intensity"),
    }),
  };

  fetchData(url, options).then(() => {
    editModal.style.display = "none";
    showToast('Exercise entry updated!');
    fetchExerciseData(); 
  });
});

document.getElementById('delete-entry').addEventListener('click', function() {
  const exerciseId = document.getElementById('edit-entry-id').value;
  if (exerciseId) {
    deleteExercise(exerciseId);
  }
});

async function deleteExercise(exerciseId) {

  if (!confirm("Are you sure you want to delete this exercise?")) {
    return;
  }

  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/exercise/${exerciseId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
    },
  };

    fetchData(url, options).then((data) => {
      console.log(data);
      showToast('Exercise deleted')
      editModal.style.display = "none";
      fetchExerciseData();
    });
  }

document
  .getElementById("fetch-data")
  .addEventListener("click", fetchExerciseData);

  document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.querySelector('.logout a');
    logoutLink.addEventListener('click', function(event) {
        event.preventDefault();
        showToast('Logging out');
  
        localStorage.removeItem('user_id');
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
    });
  });