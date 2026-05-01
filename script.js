
// =====================
// 🔑 STORAGE KEYS
// =====================
const STORAGE_KEY = "kouluapp_users";
const SESSION_KEY = "kouluapp_session";

const KEYS = {
  grades: "kouluapp_grades",
  exams: "kouluapp_exams",
  schedule: "lukujarjestys",
  target: "kouluapp_target",
  session: "kouluapp_session"
};

// =====================
// 🧩 UI HELPER
// =====================
function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = isError ? "#c0392b" : "#27ae60";
}

// =====================
// 💾 USERS STORAGE
// =====================
function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// =====================
// 📝 REGISTER
// =====================
function registerUser(username, email, password) {
  if (!username || !email || !password) {
    return { success: false, message: "Täytä kaikki kentät." };
  }

  const users = getUsers();

  if (users.some(u => u.username === username)) {
    return { success: false, message: "Käyttäjänimi on jo käytössä." };
  }

  if (users.some(u => u.email === email)) {
    return { success: false, message: "Sähköposti on jo käytössä." };
  }

  users.push({
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  return { success: true, message: "Rekisteröinti onnistui" };
}

// =====================
// 🔐 LOGIN
// =====================
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

  return { success: true, message: `Tervetuloa ${user.username}!` };
}

// =====================
// 🚪 LOGOUT + SESSION
// =====================
function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
}

// =====================
// 🧾 AUTH FORMS
// =====================
function initAuthForms() {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  const registerMessage = document.getElementById("registerMessage");
  const loginMessage = document.getElementById("loginMessage");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const result = registerUser(
        registerForm.username.value.trim(),
        registerForm.email.value.trim(),
        registerForm.password.value
      );

      showMessage(registerMessage, result.message, !result.success);
      if (result.success) registerForm.reset();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const result = loginUser(
        loginForm.identifier.value.trim(),
        loginForm.password.value
      );

      showMessage(loginMessage, result.message, !result.success);

      if (result.success) {
        loginForm.reset();
        window.location.href = "dashboard.html";
      }
    });
  }
}

// =====================
// 📊 DASHBOARD
// =====================
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

// =====================
// 📦 BACKUP EXPORT
// =====================
function exportBackup() {
  const backup = {
    grades: JSON.parse(localStorage.getItem(KEYS.grades)) || [],
    exams: JSON.parse(localStorage.getItem(KEYS.exams)) || [],
    schedule: JSON.parse(localStorage.getItem(KEYS.schedule)) || [],
    target: localStorage.getItem(KEYS.target) || null,
    session: getSession()
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "kouluapp-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

// =====================
// 📥 BACKUP IMPORT
// =====================
function importBackup() {
  const fileInput = document.getElementById("backupFile");

  if (!fileInput || !fileInput.files.length) {
    alert("Valitse backup-tiedosto!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.grades) localStorage.setItem(KEYS.grades, JSON.stringify(data.grades));
      if (data.exams) localStorage.setItem(KEYS.exams, JSON.stringify(data.exams));
      if (data.schedule) localStorage.setItem(KEYS.schedule, JSON.stringify(data.schedule));
      if (data.target !== undefined) localStorage.setItem(KEYS.target, data.target);
      if (data.session) localStorage.setItem(KEYS.session, JSON.stringify(data.session));

      alert("Backup palautettu!");
      location.reload();

    } catch (err) {
      alert("Virheellinen backup-tiedosto!");
    }
  };

  reader.readAsText(fileInput.files[0]);
}

// =====================
// 🚀 INIT
// =====================
window.addEventListener("DOMContentLoaded", () => {
  initAuthForms();
  initDashboard();
});