const ROLES = require('../../helpers/roles');

class AuthorizationManager {
    constructor() {
        this.permissions = {
            [ROLES.SUPER_ADMIN]: {
                school: ['create', 'update', 'delete', 'read'],
                classroom: ['create', 'update', 'delete', 'read'],
                student: ['create', 'update', 'delete', 'read']
            },
            [ROLES.SCHOOL_ADMIN]: {
                school: ['read'],
                classroom: ['create', 'update', 'delete', 'read'],
                student: ['create', 'update', 'delete', 'read']
            },
            [ROLES.STUDENT]: {
                school: ['read'],
                classroom: ['read'],
                student: ['read']
            }
        };
    }

    isAuthorized({ userRole, action, resource }) {
        if (!userRole || !action || !resource) {
            return false;
        }

        const rolePermissions = this.permissions[userRole];
        if (!rolePermissions) {
            return false;
        }

        const resourcePermissions = rolePermissions[resource];
        if (!resourcePermissions || !resourcePermissions.includes(action)) {
            return false;
        }

        return true;
    }
}

module.exports = AuthorizationManager;