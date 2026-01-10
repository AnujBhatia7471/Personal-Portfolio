// ================= TOAST UTILITY =================

const toast = document.getElementById("toast");
let toastTimeout = null;

/**
 * Show toast message
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 * @param {number} duration
 */
function showToast(message, type = "info", duration = 1500) {
    if (!toast) return;

    // Reset
    toast.className = "";
    toast.textContent = message;

    // Apply type
    toast.classList.add(type, "show");

    // Clear old timeout
    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}
function login() {
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.otp) {
            showToast("OTP sent successfully", "success");
            document.getElementById("otpBox").classList.remove("hidden");
        } else {
            showToast(d.error || "Login failed", "error");
        }
    })
    .catch(() => {
        showToast("Server error. Try again.", "error");
    });
}

function verify() {
    fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.value })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            showToast("Login successful", "success");
            setTimeout(() => {
                location.href = "/admin";
            }, 800);
        } else {
            showToast(d.error || "Invalid OTP", "error");
        }
    })
    .catch(() => {
        showToast("Server error. Try again.", "error");
    });
}