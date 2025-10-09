var apiclient = (function () {
    function _urlBase() { return "/blueprints"; }
    function _urlForAuthor(authorKey) {
        return _urlBase() + "/" + encodeURIComponent(authorKey);
    }
    function _urlForAuthorAndName(authorKey, bpname) {
        return _urlBase() + "/" + encodeURIComponent(authorKey) + "/" + encodeURIComponent(bpname);
    }

    function _ajaxWithPromise(options) {
        return new Promise((resolve, reject) => {
            console.log('API Request:', {
                url: options.url,
                method: options.method || options.type,
                data: options.data
            });

            $.ajax({
                ...options,
                success: (data, status, xhr) => {
                    console.log('API Success:', {
                        url: options.url,
                        status: xhr.status,
                        data: data
                    });
                    resolve(data);
                },
                error: (xhr, status, error) => {
                    console.error("API Error:", {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        error: error
                    });

                    let errorMessage = "API request failed";
                    if (xhr.status === 404) {
                        errorMessage = "Resource not found";
                    } else if (xhr.status === 400) {
                        errorMessage = "Bad request";
                    } else if (xhr.status === 500) {
                        errorMessage = "Server error";
                    } else if (xhr.responseText) {
                        errorMessage = xhr.responseText;
                    }

                    reject(new Error(errorMessage));
                }
            });
        });
    }

    return {
        // GET methods converted to Promises
        getBlueprintsByAuthor: function (authname) {
            return _ajaxWithPromise({
                url: _urlForAuthor(authname),
                method: "GET",
                dataType: "json"
            }).then(data => {
                return Array.isArray(data) ? data : Object.values(data || {});
            });
        },

        getBlueprintsByNameAndAuthor: function (authname, bpname) {
            return _ajaxWithPromise({
                url: _urlForAuthorAndName(authname, bpname),
                method: "GET",
                dataType: "json"
            }).then(data => {
                return data || null;
            });
        },

        // POST: create new blueprint
        postBlueprint: function (blueprintObj) {
            return _ajaxWithPromise({
                url: _urlBase(),
                type: 'POST',
                data: JSON.stringify(blueprintObj),
                contentType: "application/json"
            });
        },

        // PUT: update blueprint
        putBlueprint: function (authorKey, blueprintName, blueprintObj) {
            return _ajaxWithPromise({
                url: _urlForAuthorAndName(authorKey, blueprintName),
                type: 'PUT',
                data: JSON.stringify(blueprintObj),
                contentType: "application/json"
            });
        },

        // DELETE: delete blueprint
        deleteBlueprint: function (authorKey, blueprintName) {
            return _ajaxWithPromise({
                url: _urlForAuthorAndName(authorKey, blueprintName),
                type: 'DELETE'
            });
        }
    };
})();

