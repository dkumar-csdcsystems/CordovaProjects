




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfreeformcolumn',
         jspname: '_ValidFreeformColumn.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'freeformcode', type: 'INTEGER' },      
               { name: 'dislayorder', type: 'INTEGER' },
                { name: 'columnname', type: 'TEXT' },
                { name: 'columnlabel', type: 'TEXT' },
                { name: 'columnlabel2', type: 'TEXT' },
                { name: 'displaytype', type: 'TEXT' },
                { name: 'defaulltvalue', type: 'TEXT' },
                { name: 'columnexpression', type: 'TEXT' },
                { name: 'valuex', type: 'INTEGER' },
                { name: 'valuey', type: 'INTEGER' },
                { name: 'valueheight', type: 'INTEGER' },
                { name: 'valuewidth', type: 'INTEGER' },
                { name: 'valuefontname', type: 'TEXT' },
                { name: 'valuefontsize', type: 'INTEGER' },
                { name: 'valuefontweight', type: 'TEXT' },
                { name: 'valuefontcolour', type: 'INTEGER' },
                { name: 'valuebackground', type: 'INTEGER' },
                { name: 'labelx', type: 'INTEGER' },
                { name: 'labely', type: 'INTEGER' },
                { name: 'labelheight', type: 'INTEGER' },
                { name: 'labelwidth', type: 'INTEGER' },
                { name: 'labelfontname', type: 'TEXT' },
                { name: 'labelfontsize', type: 'INTEGER' },
                { name: 'labelfontweight', type: 'TEXT' },
                { name: 'labelfontcolour', type: 'INTEGER' },
                { name: 'labelbackground', type: 'INTEGER' },
                { name: 'readonly', type: 'TEXT' },
                { name: 'selectrsncolumnname', type: 'TEXT' },
                { name: 'pickselectsql', type: 'TEXT' },
              




         ]
     });});