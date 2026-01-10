function loadPublicProjects() {
    fetch("/projects")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("public-list");
            list.innerHTML = "";

            if (!data || data.length === 0) {
                list.innerHTML = "<p>No projects available.</p>";
                return;
            }

            data.forEach(p => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <img src="${p.image}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <a href="${p.link}" target="_blank">View Project</a>
                `;

                list.appendChild(card);
            });
        })
        .catch(err => {
            console.error(err);
        });
}

window.addEventListener("load", loadPublicProjects);
