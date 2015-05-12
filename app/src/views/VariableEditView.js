(function (flow, $, _, Backbone, console, d3, tangelo) {
    "use strict";

    flow.VariableEditView = Backbone.View.extend({

        variableProperties: {
            name: {name: "Name", id: "name", type: "string", format: "text"},
            id: {name: "Id", id: "id", type: "string", format: "text"},
            type: {name: "Type", id: "type", type: "string", format: "text", domain: [
                'table:rows',
                'table:objectlist',
                'table:r.dataframe',
                'table:csv',
                'table:tsv',
                'table:vtktable',
                'tree:nested',
                'tree:newick',
                'tree:r.apetree',
                'tree:vtktree',
                'string:text',
                'number:number',
                'image:png.base64',
                'r:object',
                'geometry:vtkpolydata'
            ]},
            description: {name: "Description", id: "description", type: "string", format: "text"},
            default: {name: "Default", id: "default", type: "string", format: "text"},
            constant: {name: "Fixed", id: "constant", type: "string", format: "text", domain: ["yes", "no"], default: "no"},
            values: {name: "Comma-separated list of values", id: "values", type: "string", format: "text"},
            columnNamesInput: {name: "Input for column names", id: "columnNamesInput", type: "string", format: "text"}
        },

        inputProperties: ['name', 'id', 'type', 'description', 'default', 'values', 'columnNamesInput'],

        outputProperties: ['name', 'id', 'type', 'description'],

        workflowInputProperties: ['name', 'id', 'description', 'constant', 'default', 'values', 'columnNamesInput'],

        workflowOutputProperties: ['name', 'id', 'description'],

        events: {
            'click .update': function () {
                var model, list, columnNamesInput, values = this.inputsView.values();
                model = {
                    name: values.name.data
                };
                if (values.type) {
                    model.type = values.type.data.split(':')[0];
                    model.format = values.type.data.split(':')[1];
                }
                if (values.id.data.length > 0) {
                    model.id = values.id.data;
                }
                if (values.description.data !== '') {
                    model.description = values.description.data;
                }
                if (values.default && values.default.data !== '') {
                    model['default'] = values.default;
                }
                if (values.constant) {
                    model.constant = values.constant === 'yes';
                }
                list = values.values;
                if (list && list.data !== '') {
                    model.domain = _.map(list.data.split(','), function (d) { return d.trim(); });
                }
                columnNamesInput = values.columnNamesInput;
                if (columnNamesInput && columnNamesInput.data !== '') {
                    model.domain = {format: 'column.names', input: columnNamesInput.data};
                }
                this.model.set(model);
                this.$el.modal('hide');
            }
        },

        initialize: function (settings) {
            var properties;
            this.model = settings.model;
            this.input = settings.input;
            this.workflow = settings.workflow;
            if (this.input) {
                if (this.workflow) {
                    properties = this.workflowInputProperties;
                } else {
                    properties = this.inputProperties;
                }
            } else {
                if (this.workflow) {
                    properties = this.workflowOutputProperties;
                } else {
                    properties = this.outputProperties;
                }
            }
            this.$('.properties').empty();
            this.inputsView = new flow.InputsView({
                collection: new Backbone.Collection(_.values(_.pick(this.variableProperties, properties))),
                idPrefix: 'variable-',
                el: this.$('.properties')
            });
        },

        render: function () {
            var properties;

            // Load model properties into variable properties
            this.variableProperties.name['default'] = {data: this.model.get('name')};
            this.variableProperties.id['default'] = {data: this.model.get('id')};
            this.variableProperties.constant['default'] = {data: this.model.get('constant') ? 'yes' : 'no'};
            this.variableProperties.type['default'] = {data: this.model.get('type') + ':' + this.model.get('format')};
            this.variableProperties.description['default'] = {data: this.model.get('description')};
            if (this.model.get('default') && this.model.get('default').hasOwnProperty('data')) {
                this.variableProperties['default']['default'] = {data: this.model.get('default').data};
            }

            // Set the domain-specific fields
            this.variableProperties.values['default'] = {data: ''};
            this.variableProperties.columnNamesInput['default'] = {data: ''};
            var domain = this.model.get('domain');
            if (domain) {
                if (_.isArray(domain)) {
                    this.variableProperties.values['default'] = {data: domain.join(',')};
                } else {
                    this.variableProperties.columnNamesInput['default'] = {data: domain.input};
                }
            }

            if (this.input) {
                if (this.workflow) {
                    properties = this.workflowInputProperties;
                } else {
                    properties = this.inputProperties;
                }
            } else {
                if (this.workflow) {
                    properties = this.workflowOutputProperties;
                } else {
                    properties = this.outputProperties;
                }
            }
            this.inputsView.collection.set([]);
            this.inputsView.collection.set(_.values(_.pick(this.variableProperties, properties)));

            // Show the model dialog
            this.inputsView.render();
            this.$el.modal('show');
            return this;
        }

    });

}(window.flow, window.$, window._, window.Backbone, window.console, window.d3, window.tangelo));
