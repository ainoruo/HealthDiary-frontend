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
  const medicationData = {};
  formData.forEach((value, key) => {
    medicationData[key] = value;
  });
  console.log(medicationData);

  medicationData.user_id = userId;

  try {
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/medications/${userId}`;
    const token = localStorage.getItem("token");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(medicationData),
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Failed to add medication");
    }

    form.reset();
    showToast("Medication added successfully!");
    getMedications();
  } catch (error) {
    console.error("Error adding medication:", error.message);
    showToast("Failed to add medication. Please try again.");
  }
}

async function getMedications() {
  const userId = localStorage.getItem("user_id");
  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/medications/${userId}`;
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
      element.name,
      element.dosage,
      element.frequency,
      element.start_date,
      element.end_date
    );

    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.innerText = element.name;

    const td2 = document.createElement("td");
    td2.innerText = element.dosage;

    const td3 = document.createElement("td");
    td3.innerText = element.frequency;

    const startDate = new Date(element.start_date).toLocaleDateString("fi-FI");
    const td4 = document.createElement("td");
    td4.innerText = startDate;

    const endDate = new Date(element.end_date).toLocaleDateString("fi-FI");
    const td5 = document.createElement("td");
    td5.innerText = endDate;

    const td6 = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.setAttribute("medication-id", element.medication_id);
    editButton.setAttribute("data-medication-id", element.medication_id);
    editButton.innerText = "Edit";
    editButton.addEventListener("click", (evt) => openEditModal(evt, data));
    td6.appendChild(editButton);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);

    tbody.appendChild(tr);
  });
 
  document
    .querySelectorAll(".edit")
    .forEach((button) =>
      button.addEventListener("click", (evt) => openEditModal(evt, data))
    );
}

function openEditModal(evt, data) {
  const medicationId = parseInt(evt.target.dataset.medicationId, 10);
  console.log("Entry ID:", medicationId);
  const entryData = data.find((entry) => entry.medication_id === medicationId);

  document.getElementById("edit-entry-id").value = medicationId;
  document.getElementById("edit-name").value = entryData.name;
  document.getElementById("edit-dosage").value = entryData.dosage;
  document.getElementById("edit-frequency").value = entryData.frequency;
  
  document.getElementById("edit-start-date").value = new Date(entryData.start_date).toISOString().split('T')[0];
  document.getElementById("edit-end-date").value = new Date(entryData.end_date).toISOString().split('T')[0];

  editModal.style.display = "block";
}

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const medicationId = formData.get("edit-entry-id");

  console.log("FormData:", formData);

  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/medications/${medicationId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: formData.get("edit-name"),
      dosage: formData.get("edit-dosage"),
      frequency: formData.get("edit-frequency"),
      start_date: formData.get("edit-start-date"),
      end_date: formData.get("edit-end-date"),
    }),
  };

  fetchData(url, options).then(() => {
    editModal.style.display = "none";
    showToast('Medication entry updated!');
    getMedications();
  });
});

document.getElementById('delete-entry').addEventListener('click', function() {
  const medicationId = document.getElementById('edit-entry-id').value;
  if (medicationId) {
    deleteMedication(medicationId);
  }
});

async function deleteMedication(medicationId) {

  if (!confirm("Are you sure you want to delete this exercise?")) {
    return;
  }

  const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/medications/${medicationId}`;
  const token = localStorage.getItem("token");

  const options = {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  };

    fetchData(url, options).then((data) => {
      console.log(data);
      showToast('Medication entry deleted!');
      editModal.style.display = "none";
      getMedications();
    });
  }


document.getElementById("fetch-data").addEventListener("click", getMedications);

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