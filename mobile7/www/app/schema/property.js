app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: 'property',
        jspname: '_AllProperty.jsp',
        jspname2: '_NewProperty.jsp',
        fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
           
            {
                name: 'propertyrsn', type: 'TEXT'
            },
             {
                 name: 'familyrsn', type: 'TEXT'
             },
             {
                 name: 'propertyroll', type: 'TEXT'
             },
            {
                name: 'propgisid1', type: 'TEXT'
            },
            {
                name: 'parentpropertyrsn', type: 'TEXT'
            },
            {
                name: 'datecreated', type: 'TEXT'
            },
            {
                name: 'dateobsoleted', type: 'TEXT'
            },
            {
                name: 'prophouse', type: 'TEXT'
            },
            {
                name: 'propstreet', type: 'TEXT'
            },
            {
                name: 'propstreettype', type: 'TEXT'
            },
            {
                name: 'propcity', type: 'TEXT'
            },
            {
                name: 'propprovince', type: 'TEXT'
            },
            {
                name: 'proppostal', type: 'TEXT'
            },
            {
                name: 'propunittype', type: 'TEXT'
            },
            {
                name: 'propunit', type: 'TEXT'
            },
            {
                name: 'propertyname', type: 'TEXT'
            },

             {
                 name: 'legaldesc', type: 'TEXT'
             },
              {
                  name: 'statuscode', type: 'TEXT'
              },
            {
                name: 'proparea', type: 'TEXT'
            },
            {
                name: 'propfrontage', type: 'TEXT'
            },
            {
                name: 'propdepth', type: 'TEXT'
            },
            {
                name: 'propcrossstreet', type: 'TEXT'
            },
            {
                name: 'zonetype1', type: 'TEXT'
            },

            {
                name: 'propplan', type: 'TEXT'
            },
            {
                name: 'proplot', type: 'TEXT'
            },
            {
                name: 'propsection', type: 'TEXT'
            },
             {
                 name: 'proptownship', type: 'TEXT'
             },
            {
                name: 'proprange', type: 'TEXT'
            },
             {
                 name: 'routecode', type: 'TEXT'
             },
            {
                name: 'propcomment', type: 'TEXT'
            },
            {
                name: 'propstreetdirection', type: 'TEXT'
            },
            {
                name: 'zonetype2', type: 'TEXT'
            },
            {
                name: 'zonetype3', type: 'TEXT'
            },
            {
                name: 'zonetype4', type: 'TEXT'
            },
            {
                name: 'zonetype5', type: 'TEXT'
            },
            {
                name: 'propx', type: 'TEXT'
            },
            {
                name: 'propy', type: 'TEXT'
            },
            {
                name: 'propstreetprefix', type: 'TEXT'
            },
            {
                name: 'countydesc', type: 'TEXT'
            },
            {
                name: 'propcode', type: 'TEXT'
            }
        ],
        quickSyncColumns: [
            {
                name: 'folderrsn',
                notmapped: true
            },
            {
                name: 'propertyrsn',
                keyColumn: true
            },
            {
                name: 'relationcode',
                notmapped: true
            },
             {
                 name: 'familyrsn'
             },
             {
                 name: 'propertyroll'
             },
            {
                name: 'propgisid1'
            },
            {
                name: 'parentpropertyrsn'
            },
            {
                name: 'datecreated'
            },
            {
                name: 'dateobsoleted'
            },
            {
                name: 'prophouse'
            },
            {
                name: 'propstreet'
            },
            {
                name: 'propstreettype'
            },
            {
                name: 'propcity'
            },
            {
                name: 'propprovince'
            },
            {
                name: 'proppostal'
            },
            {
                name: 'propunittype'
            },
            {
                name: 'propunit'
            },
            {
                name: 'propertyname'
            },

             {
                 name: 'legaldesc'
             },
              {
                  name: 'statuscode'
              },
            {
                name: 'proparea'
            },
            {
                name: 'propfrontage'
            },
            {
                name: 'propdepth'
            },
            {
                name: 'propcrossstreet'
            },
            {
                name: 'zonetype1'
            },

            {
                name: 'propplan'
            },
            {
                name: 'proplot'
            },
            {
                name: 'propsection'
            },
             {
                 name: 'proptownship'
             },
            {
                name: 'proprange'
            },
             {
                 name: 'routecode'
             },
            {
                name: 'propcomment'
            },
            {
                name: 'propstreetdirection'
            },
            {
                name: 'zonetype2'
            },
            {
                name: 'zonetype3'
            },
            {
                name: 'zonetype4'
            },
            {
                name: 'zonetype5'
            },
            {
                name: 'propx'
            },
            {
                name: 'propy'
            },
            {
                name: 'propstreetprefix'
            },
            {
                name: 'countydesc'
            },
            {
                name: 'propcode'
            }
        ]
    });
});