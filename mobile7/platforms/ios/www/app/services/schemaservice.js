app.provider('schemaservice', function () {
    // In the provider function, you cannot inject any
    // service or factory. This can only be done at the
    // "$get" method.
    this.schemaArray = [];
    this.$get = function () {
        var schemas = this.schemaArray;
        return {
            getSchema: function () {
                return schemas;
            }
        }
    };
    this.setSchema = function (schema) {
        this.schemaArray.push(schema);
    };
});