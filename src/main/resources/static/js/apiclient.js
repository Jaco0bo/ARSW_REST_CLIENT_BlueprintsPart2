var apiclient = (function () {

    // Helper to build endpoint paths
    function _urlForAuthor(authorKey) {
        return "/blueprints/" + encodeURIComponent(authorKey);
    }
    function _urlForAuthorAndName(authorKey, bpname) {
        return "/blueprints/" + encodeURIComponent(authorKey) + "/" + encodeURIComponent(bpname);
    }

    return {
        // callback recibe un array (o [])
        getBlueprintsByAuthor: function (authname, callback) {
            $.ajax({
                url: _urlForAuthor(authname),
                method: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    if (Array.isArray(data)) {
                        callback(data);
                    } else if (data == null) {
                        callback([]);
                    } else {
                        try {
                            var arr = Array.isArray(data) ? data : Object.values(data);
                            callback(arr);
                        } catch (e) {
                            callback([]);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("apiclient.getBlueprintsByAuthor error:", textStatus, errorThrown);
                    // En error, devolver lista vacía para mantener compatibilidad
                    callback([]);
                }
            });
        },

        // callback recibe un objeto blueprint o null
        getBlueprintsByNameAndAuthor: function (authname, bpname, callback) {
            $.ajax({
                url: _urlForAuthorAndName(authname, bpname),
                method: "GET",
                dataType: "json",
                success: function (data, textStatus, jqXHR) {
                    callback(data || null);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("apiclient.getBlueprintsByNameAndAuthor error:", textStatus, errorThrown);
                    callback(null);
                }
            });
        }
    };
})();
