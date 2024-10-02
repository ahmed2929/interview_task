# School Management API

This repository contains the School Management API, built using the existing boilerplate from the [Axion repo](https://github.com/qantra-io/axion). This project enables basic CRUD operations for managing Schools, Classrooms, and Students, with role-based permissions for Superadmins, School Admins, and Students.

## Features

- **CRUD Operations**: 
  - Schools: Manage schools (Create, Read, Update, Delete)
  - Classrooms: Manage classrooms within a school (Create, Read, Update, Delete)
  - Students: Manage students within classrooms (Create, Read, Update, Delete)
  
- **Role-Based Access Control**: 
  - **Superadmins**: Full control over schools, classrooms, students, and user management.
  - **School Admins**: Restricted to managing classrooms and students within their respective schools.
  - **Students**: Can only view information (read access) about their school, classroom, and personal data.

- **Authentication & Authorization**: 
  - JWT-based stateless authentication.
  - Custom permissions management to handle advanced authorization scenarios.
  - the implemented authorization system enables advancing permission settings so that each role has permission on a single entity
  - For ex in entity school role students can only read.
- **Authorization implementation example**:
 ```javascript
  this.permissions = {
    [ROLES.SUPER_ADMIN]: {
      school: ['create', 'update', 'delete', 'read'],
      classroom: ['create', 'update', 'delete', 'read'],
      student: ['create', 'update', 'delete', 'read'],
      user: ['create', 'update', 'delete', 'read']
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
```
  
- **Comprehensive Unit Testing**: 
  - The application includes **51 unit tests** that cover the majority of use cases.
    
   ```bash
    npm run test
    
  

### Notes 
- the deployed version can be found at: https://interview-task-3n8n.onrender.com/
- code level docs can be found: https://interview-task-3n8n.onrender.com/docs/
- APIs docs can be found in the following Postman collection: https://drive.google.com/file/d/1DzIPoWHCmU4LPRgUiOJKJ7LToqWZQNHY/view?usp=sharing

### credentials 
- The super admin account is
- username: admin
- password:123456789


