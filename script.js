
// ==========================================
// CLIENTFLOW MANAGEMENT DASHBOARD
// COMPLETE JAVASCRIPT
// ==========================================


// 1. STORAGE

function loadRecords(key) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

let clients = loadRecords("clientflow_clients");
let quotations = loadRecords("clientflow_quotations");

function saveRecords() {
    localStorage.setItem("clientflow_clients", JSON.stringify(clients));
    localStorage.setItem("clientflow_quotations", JSON.stringify(quotations));
}


// 2. HELPER FUNCTIONS

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatMoney(amount) {
    return "KSh " + Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
}


// 3. DATE AND YEAR

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-KE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// 4. PAGE NAVIGATION

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    clients: document.getElementById("clientsPage"),
    quotations: document.getElementById("quotationsPage")
};

const pageTitles = {
    dashboard: "Dashboard Overview",
    clients: "Client Management",
    quotations: "Quotation Management"
};

function showPage(pageName) {
    Object.keys(pages).forEach(function (name) {
        pages[name].classList.toggle("active", name === pageName);
    });

    document.querySelectorAll(".nav-item").forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    document.getElementById("pageTitle").textContent =
        pageTitles[pageName];

    document.getElementById("breadcrumb").textContent =
        pageName.toUpperCase();

    sidebar.classList.remove("open");

    if (pageName === "clients") {
        renderClients();
    }

    if (pageName === "quotations") {
        renderQuotations();
        updateClientOptions();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-item").forEach(function (button) {
    button.addEventListener("click", function () {
        showPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(function (button) {
    button.addEventListener("click", function () {
        showPage(button.dataset.go);
    });
});

menuButton.addEventListener("click", function () {
    sidebar.classList.toggle("open");
});


// 5. DASHBOARD STATISTICS

function updateDashboard() {
    document.getElementById("totalClients").textContent =
        clients.length;

    document.getElementById("totalQuotations").textContent =
        quotations.length;

    document.getElementById("pendingQuotations").textContent =
        quotations.filter(function (item) {
            return item.status === "Pending";
        }).length;

    document.getElementById("acceptedQuotations").textContent =
        quotations.filter(function (item) {
            return item.status === "Accepted";
        }).length;

    renderRecentClients();
}


// 6. RECENT CLIENTS

function renderRecentClients() {
    const table = document.getElementById("recentClients");

    const recent = [...clients]
        .sort(function (a, b) {
            return b.createdAt - a.createdAt;
        })
        .slice(0, 5);

    if (recent.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="3" class="empty-cell">
                    No clients added yet.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = recent.map(function (client) {
        return `
            <tr>
                <td><strong>${escapeHTML(client.name)}</strong></td>
                <td>${escapeHTML(client.email)}</td>
                <td>${formatDate(client.createdAt)}</td>
            </tr>
        `;
    }).join("");
}


// 7. CLIENT FORM CONTROLS

const clientFormPanel = document.getElementById("clientFormPanel");
const clientForm = document.getElementById("clientForm");

function openClientForm() {
    clientFormPanel.classList.remove("hidden");

    document.getElementById("clientName").focus();

    clientFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeClientForm() {
    clientFormPanel.classList.add("hidden");
    clientForm.reset();
}

document.getElementById("showClientForm").addEventListener(
    "click",
    openClientForm
);

document.getElementById("closeClientForm").addEventListener(
    "click",
    closeClientForm
);

document.getElementById("cancelClient").addEventListener(
    "click",
    closeClientForm
);


// 8. ADD NEW CLIENT

clientForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("clientName").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const business = document.getElementById("clientBusiness").value.trim();

    if (!name || !email) {
        showToast("Please enter the client name and email.");
        return;
    }

    const duplicate = clients.some(function (client) {
        return client.email.toLowerCase() === email.toLowerCase();
    });

    if (duplicate) {
        showToast("A client with this email already exists.");
        return;
    }

    const newClient = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        business: business,
        createdAt: Date.now()
    };

    clients.push(newClient);

    saveRecords();

    clientForm.reset();
    closeClientForm();

    renderClients();
    updateDashboard();
    updateClientOptions();

    showToast("Client registered successfully.");
});


// 9. DISPLAY CLIENTS

function renderClients() {
    const table = document.getElementById("clientsTable");

    const search = document.getElementById("clientSearch")
        .value.trim().toLowerCase();

    const filtered = clients.filter(function (client) {
        return (
            client.name.toLowerCase().includes(search) ||
            client.email.toLowerCase().includes(search) ||
            client.phone.toLowerCase().includes(search) ||
            client.business.toLowerCase().includes(search)
        );
    });

    document.getElementById("clientCountLabel").textContent =
        clients.length + (clients.length === 1 ? " client record" : " client records");

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    No matching client records found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map(function (client) {
        return `
            <tr>
                <td><strong>${escapeHTML(client.name)}</strong></td>
                <td>${escapeHTML(client.email)}</td>
                <td>${escapeHTML(client.phone || "—")}</td>
                <td>${escapeHTML(client.business || "—")}</td>
                <td>${formatDate(client.createdAt)}</td>
                <td>
                    <button class="delete-button"
                        data-delete-client="${client.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

document.getElementById("clientSearch").addEventListener(
    "input",
    renderClients
);


// 10. DELETE CLIENT

document.getElementById("clientsTable").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest("[data-delete-client]");

        if (!button) return;

        const clientId = Number(button.dataset.deleteClient);

        const hasQuotation = quotations.some(function (quotation) {
            return quotation.clientId === clientId;
        });

        if (hasQuotation) {
            showToast("This client has quotations. Remove those quotations first.");
            return;
        }

        if (!confirm("Are you sure you want to delete this client?")) {
            return;
        }

        clients = clients.filter(function (client) {
            return client.id !== clientId;
        });

        saveRecords();
        renderClients();
        updateDashboard();
        updateClientOptions();

        showToast("Client deleted.");
    }
);


// 11. QUOTATION FORM CONTROLS

const quotationFormPanel =
    document.getElementById("quotationFormPanel");

const quotationForm =
    document.getElementById("quotationForm");

function openQuotationForm() {
    if (clients.length === 0) {
        showToast("Register a client before creating a quotation.");
        showPage("clients");
        openClientForm();
        return;
    }

    updateClientOptions();

    quotationFormPanel.classList.remove("hidden");

    quotationFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeQuotationForm() {
    quotationFormPanel.classList.add("hidden");
    quotationForm.reset();
}

document.getElementById("showQuotationForm").addEventListener(
    "click",
    openQuotationForm
);

document.getElementById("closeQuotationForm").addEventListener(
    "click",
    closeQuotationForm
);

document.getElementById("cancelQuotation").addEventListener(
    "click",
    closeQuotationForm
);


// 12. CLIENT OPTIONS FOR QUOTATIONS

function updateClientOptions() {
    const select = document.getElementById("quotationClient");

    const previousValue = select.value;

    select.innerHTML = '<option value="">Choose a client</option>';

    clients.forEach(function (client) {
        const option = document.createElement("option");

        option.value = client.id;
        option.textContent = client.name + " — " + client.email;

        select.appendChild(option);
    });

    if (clients.some(function (client) {
        return String(client.id) === previousValue;
    })) {
        select.value = previousValue;
    }
}


// 13. CREATE QUOTATION

quotationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const clientId = Number(
        document.getElementById("quotationClient").value
    );

    const title = document.getElementById("quotationTitle")
        .value.trim();

    const amount = Number(
        document.getElementById("quotationAmount").value
    );

    const status = document.getElementById("quotationStatus").value;

    const client = clients.find(function (item) {
        return item.id === clientId;
    });

    if (!client) {
        showToast("Please select a valid client.");
        return;
    }

    if (!title || !Number.isFinite(amount) || amount <= 0) {
        showToast("Enter a project name and a valid amount.");
        return;
    }

    const newQuotation = {
        id: Date.now(),
        clientId: clientId,
        clientName: client.name,
        title: title,
        amount: amount,
        status: status,
        createdAt: Date.now()
    };

    quotations.push(newQuotation);

    saveRecords();

    quotationForm.reset();
    closeQuotationForm();

    renderQuotations();
    updateDashboard();

    showToast("Quotation created successfully.");
});


// 14. DISPLAY QUOTATIONS

function renderQuotations() {
    const table = document.getElementById("quotationsTable");

    const search = document.getElementById("quotationSearch")
        .value.trim().toLowerCase();

    const filtered = quotations.filter(function (quotation) {
        return (
            quotation.clientName.toLowerCase().includes(search) ||
            quotation.title.toLowerCase().includes(search) ||
            quotation.status.toLowerCase().includes(search)
        );
    });

    document.getElementById("quotationCountLabel").textContent =
        quotations.length +
        (quotations.length === 1 ? " quotation" : " quotations");

    if (filtered.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    No matching quotations found.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map(function (quotation) {
        const statusClass =
            quotation.status.toLowerCase();

        return `
            <tr>
                <td><strong>${escapeHTML(quotation.clientName)}</strong></td>
                <td>${escapeHTML(quotation.title)}</td>
                <td>${formatMoney(quotation.amount)}</td>
                <td>${formatDate(quotation.createdAt)}</td>
                <td>
                    <select class="status-select"
                        data-status-quotation="${quotation.id}"
                        aria-label="Change quotation status">
                        <option value="Pending"
                            ${quotation.status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>
                        <option value="Accepted"
                            ${quotation.status === "Accepted" ? "selected" : ""}>
                            Accepted
                        </option>
                        <option value="Rejected"
                            ${quotation.status === "Rejected" ? "selected" : ""}>
                            Rejected
                        </option>
                    </select>
                    <span class="status status-${statusClass}">
                        ${escapeHTML(quotation.status)}
                    </span>
                </td>
                <td>
                    <button class="delete-button"
                        data-delete-quotation="${quotation.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

document.getElementById("quotationSearch").addEventListener(
    "input",
    renderQuotations
);


// 15. CHANGE QUOTATION STATUS

document.getElementById("quotationsTable").addEventListener(
    "change",
    function (event) {
        const select = event.target.closest("[data-status-quotation]");

        if (!select) return;

        const quotationId = Number(select.dataset.statusQuotation);

        const quotation = quotations.find(function (item) {
            return item.id === quotationId;
        });

        if (!quotation) return;

        quotation.status = select.value;

        saveRecords();
        renderQuotations();
        updateDashboard();

        showToast("Quotation status updated.");
    }
);


// 16. DELETE QUOTATION

document.getElementById("quotationsTable").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest("[data-delete-quotation]");

        if (!button) return;

        const quotationId = Number(button.dataset.deleteQuotation);

        if (!confirm("Are you sure you want to delete this quotation?")) {
            return;
        }

        quotations = quotations.filter(function (quotation) {
            return quotation.id !== quotationId;
        });

        saveRecords();
        renderQuotations();
        updateDashboard();

        showToast("Quotation deleted.");
    }
);


// 17. INITIALISE APPLICATION

function initialiseDashboard() {
    updateDashboard();
    renderClients();
    renderQuotations();
    updateClientOptions();
}

initialiseDashboard();
