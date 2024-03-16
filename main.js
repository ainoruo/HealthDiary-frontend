import './style.css'
import { fetchData } from './fetch';
import { showToast } from "./toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  menuToggle.addEventListener("click", function () {
    menu.classList.toggle("show");
  });
});

async function showUserName() {
    const url = "https://hyte24.northeurope.cloudapp.azure.com/api/auth/me";
    const token = localStorage.getItem("token");
    const id = localStorage.getItem('user_id');
    console.log("Tämä on haettu LocalStoragesta", token);
    console.log('käyttäjän id: ', id);
  
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer: " + token,
      },
    };
    fetchData(url, options).then((data) => {
      document.getElementById("name").innerHTML = data.user.username;
    });
  }
  
  showUserName();

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