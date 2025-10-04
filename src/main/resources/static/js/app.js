var app = (function () {
    var _selectedAuthor = ""; // nombre tal como se muestra
    var _blueprintsSummary = []; // lista de objetos

    function _normalizeAuthorKey(name) {
        if (!name) return "";
        return name.trim().replace(/\s+/g, "").toLowerCase();
    }

    function _clearTable() {
        $("#blueprintsTable tbody").empty();
    }

    function _updateSelectedAuthorDisplay() {
        if (!_selectedAuthor) {
            $("#selectedAuthor").text("");
        } else {
            $("#selectedAuthor").text("Author: " + _selectedAuthor);
        }
    }

    function _updateTotalDisplay(total) {
        $("#totalPoints").text("Total points: " + total);
    }

    // Operaciones privadas
    function _toNameAndSize(list) {
        if (!Array.isArray(list)) return [];
        return list.map(function (bp) {
            return {
                name: bp.name || "",
                size: Array.isArray(bp.points) ? bp.points.length : 0
            };
        });
    }

    // Construye y añade filas a la tabla
    function _appendRowsFromSummary(summaryList) {
        var $tbody = $("#blueprintsTable tbody");
        // limpiar primero
        $tbody.empty();

        // map que agrega filas
        summaryList.map(function (item, index) {
            // construir <tr> con <td>
            var $tr = $("<tr>");
            $tr.append($("<td>").text(index + 1));
            $tr.append($("<td>").text(item.name));
            $tr.append($("<td>").text(_normalizeAuthorKey(_selectedAuthor)));
            $tr.append($("<td>").text(item.size));
            $tbody.append($tr);
            return $tr;
        });
    }

    // Operaciones públicas
    // Permite cambiar el nombre del autor actualmente seleccionado
    function setSelectedAuthor(displayName) {
        _selectedAuthor = displayName || "";
        _updateSelectedAuthorDisplay();
    }

    // Actualiza el listado de planos a partir del nombre del autor
    function updateBlueprintsForAuthor(authorDisplayName) {
        setSelectedAuthor(authorDisplayName);
        var key = _normalizeAuthorKey(authorDisplayName);
        if (!key) {
            _blueprintsSummary = [];
            _clearTable();
            _updateTotalDisplay(0);
            return;
        }

        // Invocar apimock
        apimock.getBlueprintsByAuthor(key, function (blueprintsList) {
            var originalList = Array.isArray(blueprintsList) ? blueprintsList : [];
            var nameSizeList = _toNameAndSize(originalList);

            // Guardar en estado privado
            _blueprintsSummary = nameSizeList;
            _appendRowsFromSummary(nameSizeList);

            // Reduce
            var total = nameSizeList.reduce(function (acc, el) {
                return acc + (el.size || 0);
            }, 0);

            // Actualizar DOM con total
            _updateTotalDisplay(total);

            if (nameSizeList.length === 0) {
                $("#selectedAuthor").append(" — no blueprints found.");
            }
        });
    }

    // Inicialización
    function init() {
        $("#getBlueprintsBtn").on("click", function (e) {
            e.preventDefault();
            var inputVal = $("#authorInput").val();
            updateBlueprintsForAuthor(inputVal);
        });

        // Permitir Enter en el input
        $("#authorInput").on("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                var inputVal = $("#authorInput").val();
                updateBlueprintsForAuthor(inputVal);
            }
        });
        _selectedAuthor = "";
        _blueprintsSummary = [];
        _clearTable();
        _updateTotalDisplay(0);
        _updateSelectedAuthorDisplay();
    }

    // Exponer solo lo necesario (API)
    return {
        init: init,
        setSelectedAuthor: setSelectedAuthor,
        updateBlueprintsForAuthor: updateBlueprintsForAuthor
    };
})();

