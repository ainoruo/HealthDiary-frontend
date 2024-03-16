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

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("settings-form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      showToast("User ID not found. Please log in again.");
      return;
    }

    const formData = new FormData(form);
    const userData = {};
    formData.forEach((value, key) => {
      userData[key] = value;
    });

    userData["user_id"] = userId;
    if (userData["new-password"] !== userData["confirm-password"]) {
      showToast("New password and confirm password do not match.");
      return;
    }

    try {
      const url = `https://hyte24.northeurope.cloudapp.azure.com/api/users/`;
      console.log("Request URL:", url);
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: userData["username"],
          password: userData["new-password"],
          email: userData["email"],
          user_id: userId,
        }),
      };
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update user data");
      }

      form.reset();

      showToast("User data updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      showToast("Failed to update user data. Please try again.");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const deleteUserButton = document.getElementById("delete-user");

  deleteUserButton.addEventListener("click", async function () {
    const userId = localStorage.getItem("user_id");
    const deleteConfirmInput = document.getElementById("delete-confirm").value;

    if (deleteConfirmInput.toLowerCase() !== "delete user") {
      showToast('You must type "delete user" to confirm deletion.');
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    const url = `https://hyte24.northeurope.cloudapp.azure.com/api/users/${userId}`;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        showToast("Account deleted successfully.");
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        window.location.href = "index.html";
      } else {
        throw new Error(
          responseData.message || "Failed to delete user account."
        );
      }
    } catch (error) {
      showToast("Failed to delete user account. Please try again.");
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutLink = document.querySelector(".logout a");
  logoutLink.addEventListener("click", function (event) {
    event.preventDefault();
    showToast("Logged out");

    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  });
});
