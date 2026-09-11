const fs = require('fs');
const file = 'appwrite.config.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.tables.forEach(table => {
    if (table.columns) {
        table.columns.forEach(col => {
            if (col.required === true) {
                col.default = null;
            }
        });
    }
    if (table.indexes) {
        table.indexes.forEach(index => {
            if (index.attributes) {
                index.columns = index.attributes;
                delete index.attributes;
            }
        });
    }
});

fs.writeFileSync(file, JSON.stringify(data, null, 4));
console.log('Fixed config');
