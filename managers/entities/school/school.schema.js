const { model } = require("mongoose");


module.exports = {
    createUser: [
        {
            label: "username",
            path: "username",
            model: 'username',
            required: true,
        },
        {
            label: "password",
            path: "password",
            model: 'password',
            required: true,
        },
        {
            label: "role",
            path: "role",
            model: 'role',
            required: true,
        }
    ],
}


