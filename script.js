const STORAGE_KEY = "kouluapp_users";
const SESSION_KEY = "kouluapp_session";

// ---------------- UI HELPER ----------------
function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#c0392b" : "#27ae60";
}

// ---------------- STORAGE ----------------
function getUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// ---------------- REGISTER ----------------
function registerUser(username, email, password) {
  if (!username || !email || !password) {
    return { success: false, message: "Täytä kaikki kentät." };
  }

  const users = getUsers();

  const existsUser = users.some(u => u.username === username);
  const existsEmail = users.some(u => u.email === email);

  if (existsUser) {
    return { success: false, message: "Käyttäjänimi on jo käytössä." };
  }

  if (existsEmail) {
    return { success: false, message: "Sähköposti on jo käytössä." };
  }

  users.push({
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  return {
    success: true,
    message: "Rekisteröinti onnistui"
  };
}

// ---------------- LOGIN ----------------
function loginUser(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: "Täytä kaikki kentät." };
  }

  const users = getUsers();

  const user = users.find(
    u => u.username === identifier || u.email === identifier
  );

  if (!user || user.password !== password) {
    return { success: false, message: "Väärä käyttäjä tai salasana." };
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      username: user.username,
      loggedInAt: new Date().toISOString()
    })
  );

  return {
    success: true,
    message: `Tervetuloa ${user.username}!`
  };
}

// ---------------- LOGOUT ----------------
function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// ---------------- SESSION ----------------
function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// ---------------- AUTH FORMS ----------------
function initAuthForms() {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const registerMessage = document.getElementById("registerMessage");
  const loginMessage = document.getElementById("loginMessage");

  // REGISTER
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = registerForm.username.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;

      const result = registerUser(username, email, password);

      showMessage(registerMessage, result.message, !result.success);

      if (result.success) registerForm.reset();
    });
  }

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const identifier = loginForm.identifier.value.trim();
      const password = loginForm.password.value;

      const result = loginUser(identifier, password);

      showMessage(loginMessage, result.message, !result.success);

      if (result.success) {
        loginForm.reset();
        window.location.href = "dashboard.html";
      }
    });
  }
}

// ---------------- DASHBOARD ----------------
function initDashboard() {
  const session = getSession();
  const userText = document.getElementById("user");

  if (!session) {
    window.location.href = "index.html";
    return;
  }

  if (userText) {
    userText.textContent = `Tervetuloa ${session.username}`;
  }
}

// ---------------- INIT ----------------
window.addEventListener("DOMContentLoaded", () => {
  initAuthForms();
  initDashboard();
});