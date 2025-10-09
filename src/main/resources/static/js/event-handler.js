class EventHandler {
    constructor(blueprintManager) {
        this.blueprintManager = blueprintManager;
        this.initialized = false; // Añadir esta bandera
    }

    initialize() {
        if (this.initialized) return; // Prevenir inicialización múltiple

        this.setupAuthorEvents();
        this.setupBlueprintEvents();
        this.initialized = true;
    }

    setupAuthorEvents() {
        const getBlueprintsBtn = document.getElementById("getBlueprintsBtn");
        const authorInput = document.getElementById("authorInput");

        if (getBlueprintsBtn) {
            getBlueprintsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.handleGetBlueprints();
            });
        }

        if (authorInput) {
            authorInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.handleGetBlueprints();
                }
            });
        }
    }

    setupBlueprintEvents() {
        const saveBtn = document.getElementById("saveBlueprintBtn");
        const createBtn = document.getElementById("createBlueprintBtn");
        const deleteBtn = document.getElementById("deleteBlueprintBtn");

        // Remover event listeners existentes primero
        if (saveBtn) {
            saveBtn.replaceWith(saveBtn.cloneNode(true));
        }
        if (createBtn) {
            createBtn.replaceWith(createBtn.cloneNode(true));
        }
        if (deleteBtn) {
            deleteBtn.replaceWith(deleteBtn.cloneNode(true));
        }

        // Re-obtener los elementos después del clon
        const newSaveBtn = document.getElementById("saveBlueprintBtn");
        const newCreateBtn = document.getElementById("createBlueprintBtn");
        const newDeleteBtn = document.getElementById("deleteBlueprintBtn");

        if (newSaveBtn) {
            newSaveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.blueprintManager.saveOrUpdateCurrentBlueprint();
            });
        }

        if (newCreateBtn) {
            newCreateBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.blueprintManager.createNewBlueprint();
            });
        }

        if (newDeleteBtn) {
            newDeleteBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.blueprintManager.deleteCurrentBlueprint();
            });
        }
    }

    handleGetBlueprints() {
        const authorInput = document.getElementById("authorInput");
        if (authorInput) {
            const inputVal = authorInput.value;
            this.blueprintManager.updateBlueprintsForAuthor(inputVal);
        }
    }
}