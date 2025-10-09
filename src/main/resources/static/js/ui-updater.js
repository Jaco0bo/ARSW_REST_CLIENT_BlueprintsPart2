class UIUpdater {
    updateSelectedAuthorDisplay(author) {
        const element = document.getElementById("selectedAuthor");
        if (element) {
            element.textContent = author ? `Author: ${author}` : "";
        }
    }

    updateTotalDisplay(total) {
        const element = document.getElementById("totalPoints");
        if (element) {
            element.textContent = `Total points: ${total}`;
        }
    }

    updateCurrentBlueprintName(blueprintName) {
        let element = document.getElementById("currentBlueprintName");
        if (!element) {
            element = document.createElement("div");
            element.id = "currentBlueprintName";
            element.className = "mb-2 fw-medium";
            const selectedAuthor = document.getElementById("selectedAuthor");
            if (selectedAuthor && selectedAuthor.parentNode) {
                selectedAuthor.parentNode.insertBefore(element, selectedAuthor.nextSibling);
            }
        }
        element.textContent = blueprintName;
    }

    appendRowsFromSummary(summaryList, author, blueprintManager) {
        const tbody = document.querySelector("#blueprintsTable tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        summaryList.forEach((item, index) => {
            const row = this.createTableRow(item, index, author, blueprintManager);
            tbody.appendChild(row);
        });
    }

    createTableRow(item, index, author, blueprintManager) {
        const row = document.createElement("tr");

        // Number
        const numCell = document.createElement("td");
        numCell.textContent = index + 1;
        row.appendChild(numCell);

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        // Author
        const authorCell = document.createElement("td");
        authorCell.textContent = author || "";
        row.appendChild(authorCell);

        // Points
        const pointsCell = document.createElement("td");
        pointsCell.textContent = item.size;
        row.appendChild(pointsCell);

        // Action
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.className = "btn btn-sm btn-outline-primary";
        button.textContent = "Draw";
        button.addEventListener("click", (e) => {
            e.preventDefault();
            blueprintManager.drawBlueprint(author, item.name);
        });
        actionCell.appendChild(button);
        row.appendChild(actionCell);

        return row;
    }

    refreshTableAndTotal(summaryList, author, blueprintManager) {
        this.appendRowsFromSummary(summaryList, author, blueprintManager);
        const total = summaryList.reduce((acc, el) => acc + (el.size || 0), 0);
        this.updateTotalDisplay(total);
    }

    clearTable() {
        const tbody = document.querySelector("#blueprintsTable tbody");
        if (tbody) {
            tbody.innerHTML = "";
        }
    }

    showNoBlueprintsMessage() {
        const element = document.getElementById("selectedAuthor");
        if (element) {
            element.textContent += " — no blueprints found.";
        }
    }

    showError(message) {
        alert(message);
    }

    showSuccess(message) {
        console.log("Success:", message);
    }
}