// var dataSource = apimock;  // Default: apimock
var dataSource = apiclient;   // Uncomment to use real API

const app = (function() {
    let blueprintManager;
    let initialized = false;

    function init() {
        if (initialized) return;

        // Initialize the main manager with data source
        blueprintManager = new BlueprintManager(dataSource);
        blueprintManager.initialize();
        initialized = true;
    }

    // Public API
    return {
        init: init,
        setSelectedAuthor: (name) => blueprintManager && blueprintManager.setSelectedAuthor(name),
        updateBlueprintsForAuthor: (name) => blueprintManager && blueprintManager.updateBlueprintsForAuthor(name),
        drawBlueprint: (author, name) => blueprintManager && blueprintManager.drawBlueprint(author, name)
    };
})();



