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
    showToast("User ID not found. Please log in again.");
    return;
  }

  const formData = new FormData(form);
  const hrvData = {};
  formData.forEach((value, key) => {
    hrvData[key] = value;
  });
  console.log(hrvData);

  const createdAt = new Date().toISOString();
  hrvData["created_at"] = createdAt;

  hrvData.user_id = userId;

  try {
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/hrv/${userId}`;
    const token = localStorage.getItem("token");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(hrvData),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Failed to add HRV Measurement");
    }

    form.reset();
    showToast("HRV measurement added successfully!");
  } catch (error) {
    console.error("Error adding HRV measurement:", error.message);
    showToast("Failed to add HRM measurement. Please try again.");
  }
}

const hrvButton = document.querySelector("#fetch-data");
hrvButton.addEventListener("click", fetchHrvData);

async function fetchHrvData() {
  const userId = localStorage.getItem("user_id");
  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/hrv/${userId}`;
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
      element.measurement_date,
      element.time_of_day,
      element.hrv_value,
      element.notes
    );

    const tr = document.createElement("tr");

    const formattedDate = new Date(element.measurement_date).toLocaleDateString(
      "fi-FI"
    );

    const td1 = document.createElement("td");
    td1.innerText = formattedDate;

    const td2 = document.createElement("td");
    td2.innerText = element.time_of_day;

    const td3 = document.createElement("td");
    td3.innerText = element.hrv_value;

    const td4 = document.createElement("td");
    td4.innerText = element.notes;

    const td5 = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.setAttribute("hrv-id", element.hrv_id);
    editButton.setAttribute("data-hrv-id", element.hrv_id);
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
  const hrvId = parseInt(evt.target.dataset.hrvId, 10);
  console.log("HRV ID:", hrvId);
  const entryData = data.find((entry) => entry.hrv_id === hrvId);

  document.getElementById("edit-entry-id").value = hrvId;
  document.getElementById("edit-date").value = entryData.measurement_date;
  document.getElementById("edit-time-of-day").value = entryData.time_of_day;
  document.getElementById("edit-hrv-value").value = entryData.hrv_value;
  document.getElementById("edit-notes").value = entryData.notes;

  editModal.style.display = "block";
}
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const hrvId = formData.get("edit-entry-id");


  console.log('FormData:', formData);


  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/hrv/${hrvId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      measurement_date: formData.get("edit-date"),
      time_of_day: formData.get("edit-time-of-day"),
      hrv_value: formData.get("edit-hrv-value"),
      notes: formData.get("edit-notes"),
    }),
  };

  fetchData(url, options).then(() => {
    editModal.style.display = "none";
    showToast('HRV measurement updated!');
    fetchHrvData(); 
  });
});

document.getElementById('delete-entry').addEventListener('click', function() {
  const hrvId = document.getElementById('edit-entry-id').value;
  if (hrvId) {
    deleteHrv(hrvId);
  }
});

async function deleteHrv(hrvId) {
  if (!confirm("Are you sure you want to delete this Hrv Entry?")) {
    return;
  }

  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/hrv/${hrvId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer: " + token,
    },
  };

    fetchData(url, options).then((data) => {
      console.log(data);
      showToast('HRV measurement deleted!');
      editModal.style.display = "none";
      fetchHrvData();
    });
  }


document.getElementById("fetch-data").addEventListener("click", fetchHrvData);

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