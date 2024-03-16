import './style.css';
import { fetchData } from './fetch.js';
import { showToast } from "./toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  menuToggle.addEventListener("click", function () {
    menu.classList.toggle("show");
  });
});

  
const loginUser = document.querySelector('.loginuser');

loginUser.addEventListener('click', async (evt) => {
  evt.preventDefault();
  const url = 'https://hyte24.northeurope.cloudapp.azure.com/api/auth/login';

  const form = document.querySelector('.login_form');

  const data = {
    username: form.querySelector('input[name=username]').value,
    password: form.querySelector('input[name=password]').value,
  };

  const options = {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), 
  };

  fetchData(url, options).then((data) => {
    console.log(data);
    console.log(data.token);
    localStorage.setItem('token', data.token);

    if (data.token == undefined) {
      showToast('Unauthorized: username or password incorrect!');
    } else {
      showToast(data.message);
      localStorage.setItem('name', data.user.username);
      localStorage.setItem('user_id',data.user.user_id);
      setTimeout(() => {
        window.location.href = 'diary.html';
      }, 2000);
      
      }
      logResponse('loginResponse', `localStorage set with token 
      value: ${data.token}`);
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const createUserLink = document.querySelector(".create-user-link");
    const modal = document.getElementById("modal");
  
    createUserLink.addEventListener("click", function() {
      modal.style.display = "block";
    });
  
    const close = modal.querySelector(".close");
    close.addEventListener("click", function() {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  });
  
  
    const url = "https://hyte24.northeurope.cloudapp.azure.com/api/users";

    const form = document.querySelector(".modal-content");

    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
  

      const username = form.querySelector("input[name=username]").value;

      const data = {
        username: username,
        password: form.querySelector("input[name=password]").value,
        email: form.querySelector("input[name=email]").value,
      };
    
      const options = {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), 
      };
    
      try {
        const responseData = await fetchData(url, options);
        console.log(responseData);
        if (responseData.user_id) {
            showToast("User created successfully!"); 
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);

            
        } else {
            showToast("Failed to create user. Please try again.");
        }
    } catch (error) {
        console.error(error);
        showToast("Failed to create user. Please try again.");
    }
});
