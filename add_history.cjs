const fs = require('fs');
const file = 'appwrite.config.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const existing = data.tables.find(t => t.$id === 'user_history');
if (!existing) {
    data.tables.push({
        '$id': 'user_history',
        '$permissions': [
            'create("users")',
            'read("users")'
        ],
        'databaseId': '6a789c5430b868b6d118',
        'name': 'User History',
        'enabled': true,
        'rowSecurity': true,
        'columns': [
            { 'key': 'userId', 'type': 'string', 'required': true, 'array': false, 'size': 36, 'default': null, 'encrypt': false },
            { 'key': 'toolUsed', 'type': 'string', 'required': true, 'array': false, 'size': 255, 'default': null, 'encrypt': false },
            { 'key': 'fileName', 'type': 'string', 'required': true, 'array': false, 'size': 500, 'default': null, 'encrypt': false },
            { 'key': 'createdAt', 'type': 'datetime', 'required': true, 'array': false, 'default': null, 'format': '' }
        ],
        'indexes': [
            { 'key': 'userId_createdAt', 'type': 'key', 'attributes': ['userId', 'createdAt'], 'orders': ['ASC', 'DESC'] }
        ]
    });
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
    console.log('Added user_history to appwrite.config.json');
} else {
    console.log('user_history already exists');
}

