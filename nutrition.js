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
    const nutritionData = {};
    formData.forEach((value, key) => {
      nutritionData[key] = value;
    });
    console.log(nutritionData);
  
    nutritionData.user_id = userId;
  
    try {
      const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/nutrition/${userId}`;
      const token = localStorage.getItem("token");
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nutritionData),
      };
  
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error("Failed to add nutrition entry");
      }

      form.reset();
      showToast("Nutrition entry added successfully!");
    } catch (error) {
      showToast("Failed to add nutrition entry. Please try again.");
    }
  }

  async function getNutritions() {
    const userId = localStorage.getItem("user_id");
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/nutrition/${userId}`;
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
        element.entry_date,
        element.calories_consumed,
        element.carbohydrates_grams,
        element.protein_grams,
        element.fat_grams,
        element.notes
      );
  
      const tr = document.createElement("tr");

      const formattedDate = new Date(element.entry_date).toLocaleDateString(
        "fi-FI"
      );
  
      const td1 = document.createElement("td");
      td1.innerText = formattedDate;
  
      const td2 = document.createElement("td");
      td2.innerText = parseInt(element.calories_consumed).toFixed(0);
  
      const td3 = document.createElement("td");
      td3.innerText = parseInt(element.carbohydrates_grams).toFixed(0);
  
      const td4 = document.createElement("td");
      td4.innerText = parseInt(element.protein_grams).toFixed(0);
  
      const td5 = document.createElement("td");
      td5.innerText = parseInt(element.fat_grams).toFixed(0);

      const td6 = document.createElement('td');
      td6.innerText = element.notes;
    
      const td7 = document.createElement("td");
      const editButton = document.createElement("button");
      editButton.className = "edit";
      editButton.setAttribute("nutrition-id", element.nutrition_id);
      editButton.setAttribute("data-nutrition-id", element.nutrition_id);
      editButton.innerText = "Edit";
      editButton.addEventListener("click", (evt) => openEditModal(evt, data));
      td7.appendChild(editButton);
  
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tr.appendChild(td7);
  
      tbody.appendChild(tr);
    });
   
    document
      .querySelectorAll(".edit")
      .forEach((button) =>
        button.addEventListener("click", (evt) => openEditModal(evt, data))
      );
  }

  function openEditModal(evt, data) {
    const nutritionId = parseInt(evt.target.dataset.nutritionId, 10);
    console.log("Nutrition ID:", nutritionId);
    const entryData = data.find((entry) => entry.nutrition_id === nutritionId);
  
    document.getElementById("edit-entry-id").value = nutritionId;
    document.getElementById("edit-date").value = entryData.entry_date;
    document.getElementById("edit-calories-consumed").value = entryData.calories_consumed;
    document.getElementById("edit-carbohydrates-grams").value = entryData.carbohydrates_grams;
    document.getElementById("edit-protein-grams").value = entryData.protein_grams;
    document.getElementById("edit-fat-grams").value = entryData.fat_grams;
    document.getElementById("edit-notes").value = entryData.notes;
  
    editModal.style.display = "block";
  }
  
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const nutritionId = formData.get("edit-entry-id");
  
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/nutrition/${nutritionId}`;
    const token = localStorage.getItem("token");
  
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        entry_date: formData.get("edit-date"),
        calories_consumed: formData.get("edit-calories-consumed"),
        carbohydrates_grams: formData.get("edit-carbohydrates-grams"),
        protein_grams: formData.get("edit-protein-grams"),
        fat_grams: formData.get("edit-fat-grams"),
        notes: formData.get("edit-notes"),
      }),
    };
  
    fetchData(url, options).then(() => {
      editModal.style.display = "none";
      showToast('Nutrition entry updated');
      getNutritions();
    });
  });
  
  document.getElementById('delete-entry').addEventListener('click', function() {
    const nutritionId = document.getElementById('edit-entry-id').value;
    if (nutritionId) {
      deleteNutrition(nutritionId);
    }
  });
  
  
  async function deleteNutrition(nutritionId) {

    if (!confirm("Are you sure you want to delete this nutrition entry?")) {
      return;
    }
  
    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/entries/nutrition/${nutritionId}`;
    const token = localStorage.getItem("token");
  
    const options = {
      method: "DELETE",
      headers: {
        Authorization: "Bearer: " + token,
      },
    };
  
      fetchData(url, options).then((data) => {
        console.log(data);
        showToast('Nutrition entry deleted');
        editModal.style.display = "none";
        getNutritions();
      });
    }

  
  document.getElementById("fetch-data").addEventListener("click", getNutritions);
  
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