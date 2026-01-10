let editId = null;

// ---------------- LOAD PROJECTS ----------------
function load() {
    fetch("/projects")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("list");
            list.innerHTML = "";

            data.forEach(p => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <img src="${p.image}" alt="">
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <a href="${p.link}" target="_blank">Open Project</a>

                    <div class="card-actions">
                        <button onclick="editProject(${p.id})">Update</button>
                        <button class="delete" onclick="deleteProject(${p.id})">Delete</button>
                    </div>
                `;

                list.appendChild(card);
            });
        });
}

// ---------------- DUPLICATE CHECK ----------------
function isDuplicate(data, name, link, ignoreId = null) {
    return data.some(p =>
        (ignoreId === null || p.id !== ignoreId) &&
        (
            p.name.toLowerCase() === name.toLowerCase() ||
            p.link === link
        )
    );
}

// ---------------- ADD PROJECT ----------------
function add() {
    const name = document.getElementById("name").value.trim();
    const image = document.getElementById("image").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const link = document.getElementById("link").value.trim();

    if (!name || !image || !desc || !link) {
        showToast("All fields are required", "error");
        return;
    }

    fetch("/projects")
        .then(res => res.json())
        .then(data => {
            if (isDuplicate(data, name, link)) {
                showToast("Duplicate project detected", "error");
                return;
            }

            fetch("/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    image,
                    description: desc,
                    link
                })
            }).then(() => {
                clearForm();
                load();
                showToast("Project added successfully", "success");
            });
        });
}

// ---------------- EDIT PROJECT ----------------
function editProject(id) {
    fetch("/projects")
        .then(res => res.json())
        .then(data => {
            const p = data.find(item => item.id === id);
            if (!p) return;

            editId = p.id;
            document.getElementById("name").value = p.name;
            document.getElementById("image").value = p.image;
            document.getElementById("desc").value = p.description;
            document.getElementById("link").value = p.link;

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
}

// ---------------- UPDATE PROJECT ----------------
function update() {
    if (editId === null) {
        showToast("Click Update on a project first", "info");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const image = document.getElementById("image").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const link = document.getElementById("link").value.trim();

    fetch("/projects")
        .then(res => res.json())
        .then(data => {
            if (isDuplicate(data, name, link, editId)) {
                showToast("Duplicate project detected", "error");
                return;
            }

            fetch("/projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editId,
                    name,
                    image,
                    description: desc,
                    link
                })
            }).then(() => {
                editId = null;
                clearForm();
                load();
                showToast("Project updated successfully", "success");
            });
        });
}

// ---------------- TOAST ----------------
function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `show ${type}`;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 1500);
}
let deleteTargetId = null;

// ---------------- DELETE PROJECT ----------------
function deleteProject(id) {
    deleteTargetId = id;
    document.getElementById("confirmModal").classList.add("show");
}
document.getElementById("confirmCancel").onclick = () => {
    deleteTargetId = null;
    document.getElementById("confirmModal").classList.remove("show");
};

document.getElementById("confirmDelete").onclick = () => {
    if (!deleteTargetId) return;

    fetch(`/projects?id=${deleteTargetId}`, {
        method: "DELETE"
    }).then(() => {
        load();
        showToast("Project deleted", "success");
        deleteTargetId = null;
        document.getElementById("confirmModal").classList.remove("show");
    });
};


// ---------------- CLEAR FORM ----------------
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("image").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("link").value = "";
}

// ---------------- INIT ----------------
window.onload = load;
