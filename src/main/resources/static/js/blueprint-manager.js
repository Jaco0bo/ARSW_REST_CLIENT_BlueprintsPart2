class BlueprintManager {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.selectedAuthor = "";
        this.blueprintsSummary = [];
        this.currentBlueprint = null;
        this.isCanvasActive = false;
        this.isCreateMode = false;

        this.canvasRenderer = new CanvasRenderer();
        this.uiUpdater = new UIUpdater();
        this.eventHandler = new EventHandler(this);
    }

    async updateBlueprintsForAuthor(authorDisplayName) {
        this.selectedAuthor = authorDisplayName || "";
        this.uiUpdater.updateSelectedAuthorDisplay(this.selectedAuthor);

        const key = this.normalizeAuthorKey(authorDisplayName);
        if (!key) {
            this.resetState();
            return;
        }

        try {
            const blueprintsList = await this.dataSource.getBlueprintsByAuthor(key);
            const nameSizeList = this.toNameAndSize(blueprintsList);

            this.blueprintsSummary = nameSizeList;
            this.uiUpdater.appendRowsFromSummary(nameSizeList, this.selectedAuthor, this);

            const total = nameSizeList.reduce((acc, el) => acc + (el.size || 0), 0);
            this.uiUpdater.updateTotalDisplay(total);

            if (nameSizeList.length === 0) {
                this.uiUpdater.showNoBlueprintsMessage();
            }

            // Reset current selection when author changes
            this.isCanvasActive = false;
            this.currentBlueprint = null;
            this.canvasRenderer.clearCanvas();

        } catch (error) {
            console.error("Error loading blueprints:", error);
            this.uiUpdater.showError("Failed to load blueprints");
        }
    }

    async drawBlueprint(authorDisplayName, blueprintName) {
        if (!blueprintName) {
            this.uiUpdater.showError("Blueprint name required.");
            return;
        }

        const key = this.normalizeAuthorKey(authorDisplayName);
        if (!key) {
            this.uiUpdater.showError("Author required to draw the blueprint.");
            return;
        }

        try {
            const bp = await this.dataSource.getBlueprintsByNameAndAuthor(key, blueprintName);
            if (!bp) {
                this.uiUpdater.showError("Blueprint not found for author: " + authorDisplayName);
                return;
            }

            this.uiUpdater.updateCurrentBlueprintName(blueprintName);

            // Store a copy for editing
            this.currentBlueprint = {
                name: bp.name,
                points: Array.isArray(bp.points) ? bp.points.slice() : []
            };

            this.isCanvasActive = true;
            this.canvasRenderer.renderPoints(this.currentBlueprint.points, this);

        } catch (error) {
            console.error("Error loading blueprint:", error);
            this.uiUpdater.showError("Failed to load blueprint");
        }
    }

    async saveOrUpdateCurrentBlueprint() {
        if (!this.currentBlueprint) {
            this.uiUpdater.showError("No blueprint selected to save.");
            return;
        }
        const payload = this.buildBlueprintPayload();
        const authorKey = this.normalizeAuthorKey(this.selectedAuthor);
        const blueprintName = this.currentBlueprint.name;

        try {
            if (this.isCreateMode) {
                await this.dataSource.postBlueprint(payload);
                this.isCreateMode = false;
                this.uiUpdater.showSuccess("Blueprint created successfully");
            } else {
                await this.dataSource.putBlueprint(authorKey, blueprintName, payload);
                this.uiUpdater.showSuccess("Blueprint updated successfully");
            }
            await this.updateBlueprintsForAuthor(this.selectedAuthor);

        } catch (error) {
            console.error("Save failed:", error);
            this.uiUpdater.showError("Save failed: " + (error.message || "Unknown error"));

            if (this.isCreateMode) {
                this.isCreateMode = false;
            }
        }
    }

    async createNewBlueprint() {
        // Verificar que tenemos un autor seleccionado
        if (!this.selectedAuthor) {
            this.uiUpdater.showError("Please select an author first");
            return;
        }

        const newName = prompt("Enter name for new blueprint:");
        if (!newName) return;

        // Verificar si el nombre ya existe
        const exists = this.blueprintsSummary.some(bp =>
            bp.name.toLowerCase() === newName.toLowerCase()
        );

        if (exists) {
            this.uiUpdater.showError("A blueprint with this name already exists");
            return;
        }

        this.currentBlueprint = {
            name: newName,
            points: []
        };
        this.isCanvasActive = true;
        this.isCreateMode = true;

        this.canvasRenderer.clearCanvas();
        this.uiUpdater.updateCurrentBlueprintName("New: " + newName);

        // No añadir inmediatamente al summary - esperar a que se guarde
        this.uiUpdater.showSuccess("New blueprint created. Add points and click Save.");
    }

    async deleteCurrentBlueprint() {
        if (!this.currentBlueprint) {
            this.uiUpdater.showError("No blueprint selected to delete.");
            return;
        }

        const authorKey = this.normalizeAuthorKey(this.selectedAuthor);
        const name = this.currentBlueprint.name;

        if (!confirm(`Delete blueprint '${name}'?`)) return;

        try {
            await this.dataSource.deleteBlueprint(authorKey, name);

            // Refresh the list and reset state
            await this.updateBlueprintsForAuthor(this.selectedAuthor);
            this.currentBlueprint = null;
            this.isCanvasActive = false;
            this.canvasRenderer.clearCanvas();
            this.uiUpdater.updateCurrentBlueprintName("");

            this.uiUpdater.showSuccess("Blueprint deleted successfully");

        } catch (error) {
            console.error("Delete failed:", error);
            this.uiUpdater.showError("Delete failed: " + (error.message || "Unknown error"));
        }
    }

    addPointToCurrentBlueprint(point) {
        if (!this.isCanvasActive || !this.currentBlueprint) return;

        this.currentBlueprint.points.push(point);

        // Update summary and UI
        const blueprintSummary = this.blueprintsSummary.find(bp => bp.name === this.currentBlueprint.name);
        if (blueprintSummary) {
            blueprintSummary.size = this.currentBlueprint.points.length;
        }

        this.uiUpdater.refreshTableAndTotal(this.blueprintsSummary, this.selectedAuthor, this);
        this.canvasRenderer.renderPoints(this.currentBlueprint.points, this);
    }

    // Helper methods
    normalizeAuthorKey(name) {
        if (!name) return "";
        return name.trim().replace(/\s+/g, "").toLowerCase();
    }

    toNameAndSize(list) {
        if (!Array.isArray(list)) return [];
        return list.map(bp => ({
            name: bp.name || "",
            size: Array.isArray(bp.points) ? bp.points.length : 0
        }));
    }

    buildBlueprintPayload() {
        if (!this.currentBlueprint) return null;

        const payload = {
            author: this.normalizeAuthorKey(this.selectedAuthor),
            name: this.currentBlueprint.name,
            points: Array.isArray(this.currentBlueprint.points) ?
                this.currentBlueprint.points.slice() : []
        };

        console.log('Built payload:', payload);
        return payload;
    }

    resetState() {
        this.blueprintsSummary = [];
        this.uiUpdater.clearTable();
        this.uiUpdater.updateTotalDisplay(0);
        this.isCanvasActive = false;
        this.currentBlueprint = null;
        this.canvasRenderer.clearCanvas();
    }

    initialize() {
        this.eventHandler.initialize();
        this.canvasRenderer.initialize(this);
        this.resetState();
    }
}