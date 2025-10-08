// static/js/app.js
var app = (function () {
    var dataSource = apimock;          // <-- default: apimock
    // var dataSource = apiclient;     // <-- descomenta esta línea para usar la API real

    // --- Estado privado ---
    var _selectedAuthor = ""; // display name
    var _blueprintsSummary = []; // lista de {name, size}
    var _currentBlueprint = null; // { name: string, points: [ {x,y}, ... ] } copia en memoria del blueprint mostrado
    var _drawTransform = null; // {minX,maxX,minY,maxY,scale,padding,cw,ch} calculado en renderizado (para invertir)
    var _canvas = null;
    var _isCanvasActive = false;

    // --- Helpers ---
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

    function _toNameAndSize(list) {
        if (!Array.isArray(list)) return [];
        return list.map(function (bp) {
            return {
                name: bp.name || "",
                size: Array.isArray(bp.points) ? bp.points.length : 0
            };
        });
    }

    function _findRowByBlueprintName(name) {
        var found = null;
        $("#blueprintsTable tbody tr").each(function () {
            var $cells = $(this).find("td");
            var bpName = $cells.eq(1).text();
            if (bpName === name) {
                found = $(this);
                return false; // break
            }
        });
        return found;
    }

    function _updateSizeInTable(name, newSize) {
        var $row = _findRowByBlueprintName(name);
        if ($row) {
            // Points column is index 3 (0-based): ID, Name, Author, Points
            $row.find("td").eq(3).text(newSize);
        }
    }

    // construye y añade filas a la tabla (incluye botón Draw)
    function _appendRowsFromSummary(summaryList) {
        var $tbody = $("#blueprintsTable tbody");
        $tbody.empty();

        summaryList.map(function (item, index) {
            var $tr = $("<tr>");
            $tr.append($("<td>").text(index + 1));
            $tr.append($("<td>").text(item.name));
            $tr.append($("<td>").text(_selectedAuthor || ""));
            $tr.append($("<td>").text(item.size));

            var $actionTd = $("<td>");
            var $btn = $("<button>")
                .addClass("btn btn-sm btn-outline-primary")
                .text("Draw");

            $btn.on("click", function (e) {
                e.preventDefault();
                app.drawBlueprint(_selectedAuthor, item.name);
            });

            $actionTd.append($btn);
            $tr.append($actionTd);

            $tbody.append($tr);
            return $tr;
        });
    }

    // --- RENDER / DIBUJO (separado para poder reutilizar) ---
    function _renderPoints(points) {
        if (!_canvas) _canvas = document.getElementById("blueprintCanvas");
        if (!_canvas) return;
        var ctx = _canvas.getContext("2d");
        var cw = _canvas.width;
        var ch = _canvas.height;
        ctx.clearRect(0, 0, cw, ch);

        if (!Array.isArray(points) || points.length === 0) {
            // nothing to draw
            ctx.font = "14px Arial";
            ctx.fillText("No points to draw.", 10, 20);
            _drawTransform = null;
            return;
        }
        // compute bounds
        var xs = points.map(function (p) { return p.x; });
        var ys = points.map(function (p) { return p.y; });
        var minX = Math.min.apply(null, xs);
        var maxX = Math.max.apply(null, xs);
        var minY = Math.min.apply(null, ys);
        var maxY = Math.max.apply(null, ys);
        var padding = 20;
        var dataW = (maxX - minX) || 1;
        var dataH = (maxY - minY) || 1;
        var scaleX = (cw - 2 * padding) / dataW;
        var scaleY = (ch - 2 * padding) / dataH;
        var scale = Math.min(scaleX, scaleY);

        // store transform for inverse mapping (pointer -> data coords)
        _drawTransform = {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY,
            scale: scale,
            padding: padding,
            cw: cw,
            ch: ch
        };

        function mapPoint(p) {
            var x = (p.x - minX) * scale + padding;
            var y = (maxY - p.y) * scale + padding; // flip Y
            return { x: x, y: y };
        }

        // draw polyline
        ctx.beginPath();
        var p0 = mapPoint(points[0]);
        ctx.moveTo(p0.x, p0.y);
        for (var i = 1; i < points.length; i++) {
            var mp = mapPoint(points[i]);
            ctx.lineTo(mp.x, mp.y);
        }
        ctx.strokeStyle = "#007bff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // draw small circles
        for (var j = 0; j < points.length; j++) {
            var mp2 = mapPoint(points[j]);
            ctx.beginPath();
            ctx.arc(mp2.x, mp2.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#ff5722";
            ctx.fill();
        }
    }

    // --- Eventos del canvas ---
    function _onPointerDown(e) {
        // only handle if a blueprint is active
        if (!_isCanvasActive || !_currentBlueprint) return;

        // get canvas coordinate (account for CSS scaling)
        var rect = _canvas.getBoundingClientRect();
        // map client coords to canvas pixel coords
        var canvasX = (e.clientX - rect.left) * (_canvas.width / rect.width);
        var canvasY = (e.clientY - rect.top) * (_canvas.height / rect.height);

        // inverse map to data coords
        var dataPoint = null;
        if (_drawTransform) {
            var dt = _drawTransform;
            var xData = (canvasX - dt.padding) / dt.scale + dt.minX;
            var yData = dt.maxY - (canvasY - dt.padding) / dt.scale;
            dataPoint = { x: Math.round(xData), y: Math.round(yData) };
        } else {
            // fallback: store pixel coordinates (not ideal but safe)
            dataPoint = { x: Math.round(canvasX), y: Math.round(canvasY) };
        }

        // append to current blueprint in memory
        _currentBlueprint.points.push(dataPoint);

        // update internal summary and DOM: find blueprint in _blueprintsSummary and increment size
        for (var i = 0; i < _blueprintsSummary.length; i++) {
            if (_blueprintsSummary[i].name === _currentBlueprint.name) {
                _blueprintsSummary[i].size = Array.isArray(_currentBlueprint.points) ? _currentBlueprint.points.length : 0;
                break;
            }
        }

        // update table cell for this blueprint and total
        _updateSizeInTable(_currentBlueprint.name, _currentBlueprint.points.length);
        var total = _blueprintsSummary.reduce(function (acc, el) {
            return acc + (el.size || 0);
        }, 0);
        _updateTotalDisplay(total);

        // repaint using the new points
        _renderPoints(_currentBlueprint.points);
    }

    function _enableCanvasHandlers() {
        _canvas = document.getElementById("blueprintCanvas");
        if (!_canvas) return;

        // Use Pointer Events (unified mouse/touch/stylus)
        _canvas.addEventListener("pointerdown", _onPointerDown);
        _canvas.addEventListener("click", function (e) {
            _onPointerDown(e);
        });
    }

    // --- Operaciones públicas ---
    function setSelectedAuthor(displayName) {
        _selectedAuthor = displayName || "";
        _updateSelectedAuthorDisplay();
    }

    function updateBlueprintsForAuthor(authorDisplayName) {
        setSelectedAuthor(authorDisplayName);
        var key = _normalizeAuthorKey(authorDisplayName);
        if (!key) {
            _blueprintsSummary = [];
            _clearTable();
            _updateTotalDisplay(0);
            _isCanvasActive = false;
            _currentBlueprint = null;
            _renderPoints([]); // clear canvas
            return;
        }

        dataSource.getBlueprintsByAuthor(key, function (blueprintsList) {
            var originalList = Array.isArray(blueprintsList) ? blueprintsList : [];
            var nameSizeList = _toNameAndSize(originalList);

            _blueprintsSummary = nameSizeList;
            _appendRowsFromSummary(nameSizeList);

            var total = nameSizeList.reduce(function (acc, el) {
                return acc + (el.size || 0);
            }, 0);

            _updateTotalDisplay(total);

            if (nameSizeList.length === 0) {
                $("#selectedAuthor").append(" — no blueprints found.");
            }

            // clear current blueprint selection when author changes
            _isCanvasActive = false;
            _currentBlueprint = null;
            _renderPoints([]);
        });
    }

    // obtiene blueprint (de dataSource) y lo dibuja; además lo guarda como copia en memoria para poder modificarlo con clicks
    function drawBlueprint(authorDisplayName, blueprintName) {
        if (!blueprintName) {
            alert("Blueprint name required.");
            return;
        }

        var key = _normalizeAuthorKey(authorDisplayName);
        if (!key) {
            alert("Author required to draw the blueprint.");
            return;
        }

        dataSource.getBlueprintsByNameAndAuthor(key, blueprintName, function (bp) {
            if (!bp) {
                alert("Blueprint not found for author: " + authorDisplayName);
                return;
            }

            // create/display currentBlueprintName div if missing
            if ($("#currentBlueprintName").length === 0) {
                $("<div id='currentBlueprintName' class='mb-2 fw-medium'></div>").insertAfter("#selectedAuthor");
            }
            $("#currentBlueprintName").text("Drawing: " + blueprintName);

            // store a deep-ish copy in memory (so further clicks modify in-memory, not source)
            _currentBlueprint = {
                name: bp.name,
                points: Array.isArray(bp.points) ? bp.points.slice() : []
            };

            // ensure canvas handlers exist and canvas cleared
            if (!_canvas) _enableCanvasHandlers();

            // mark canvas as active
            _isCanvasActive = true;

            // render points and set transform used by pointer handler
            _renderPoints(_currentBlueprint.points);
        });
    }

    // Inicialización
    function init() {
        $("#getBlueprintsBtn").on("click", function (e) {
            e.preventDefault();
            var inputVal = $("#authorInput").val();
            updateBlueprintsForAuthor(inputVal);
        });

        $("#authorInput").on("keypress", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                var inputVal = $("#authorInput").val();
                updateBlueprintsForAuthor(inputVal);
            }
        });

        _selectedAuthor = "";
        _blueprintsSummary = [];
        _currentBlueprint = null;
        _drawTransform = null;
        _isCanvasActive = false;
        _clearTable();
        _updateTotalDisplay(0);
        _updateSelectedAuthorDisplay();

        // prepare canvas variable and clear it
        _canvas = document.getElementById("blueprintCanvas");
        if (_canvas && _canvas.getContext) {
            var ctx = _canvas.getContext("2d");
            ctx.clearRect(0, 0, _canvas.width, _canvas.height);
        }

        // setup handlers now (they check _isCanvasActive before acting)
        _enableCanvasHandlers();
    }

    // Exponer API pública
    return {
        init: init,
        setSelectedAuthor: setSelectedAuthor,
        updateBlueprintsForAuthor: updateBlueprintsForAuthor,
        drawBlueprint: drawBlueprint
    };
})();



