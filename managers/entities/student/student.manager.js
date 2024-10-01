module.exports = class StudentManager { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.httpExposed         = ["post=create","put=update","delete=delete","get=getByID","get=getAll"];
        this.name                = "student";
        this.managers            = managers;
    }

    async create({firstName, lastName, classroomId,username,password, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'create', resource: 'student'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
           
            const student = {firstName, lastName, classroomId,username,password};
            let result = await this.validators.student.createStudent(student);
            if(result) return result;

            // Check if classroom exists
            const classroom = await this.mongomodels.classroom.findById(classroomId);
            if(!classroom) return {error: 'classroom not found', status: 404, ok: false};

            // Creation Logic
            // create user
            // check if username exists
            let userExists = await this.mongomodels.user.findOne({username});
            if(userExists) return {error: 'User already exists', status: 409,ok: false};
            let user = {username, password, role: 'student'};
            let createdUser = await this.mongomodels.user.create(user);

            let createdStudent = await this.mongomodels.student.create({
                firstName, 
                lastName, 
                classroomId, 
                userId: createdUser._id
                });

            // Response
            return {
                student: {
                    firstName: createdStudent.firstName,
                    lastName: createdStudent.lastName,
                    id: createdStudent._id,
                    classroomId: createdStudent.classroomId,
                    userId: createdStudent.userId
                }
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update({firstName, lastName, classroomId, id,username, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'update', resource: 'student'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
          
            const student = {firstName, lastName, classroomId, id};
            let result = await this.validators.student.updateStudent(student);
            if(result) return result;

            const studentExists = await this.mongomodels.student.findById(id);
            if(!studentExists) return {error: 'student not found', status: 404, ok: false};

            // Check if classroom exists
            const classroom = await this.mongomodels.classroom.findById(classroomId);
            if(!classroom) return {error: 'classroom not found', status: 404, ok: false};

            if(username){
                // Check if username exists
                let userExists = await this.mongomodels.user.findOne({username, _id: {$ne: studentExists.userId}});
                if(userExists) return {error: 'User already exists', status: 409,ok: false};
                let user = {username};
               await this.mongomodels.user.findByIdAndUpdate(studentExists.userId, user, { new: true, runValidators: true });
            }

            // Update Logic
            let updatedStudent = await this.mongomodels.student.findByIdAndUpdate(id, student, { new: true, runValidators: true });

            // Response
            return {
                student: {
                    firstName: updatedStudent.firstName,
                    lastName: updatedStudent.lastName,
                    id: updatedStudent._id,
                    classroomId: updatedStudent.classroomId,
                }
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete({__query, __longToken}){
        try {
            const id = __query.id;
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'delete', resource: 'student'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};

            const student = {id};
            let result = await this.validators.student.deleteStudent(student);
            if(result) return result;

            const studentExists = await this.mongomodels.student.findById(id);
            if(!studentExists) return {error: 'student not found', status: 404, ok: false};

            // Deletion Logic
            let deletedStudent = await this.mongomodels.student.findByIdAndDelete(id);

            // Response
            return {
                student: deletedStudent
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getByID({__query, __longToken}){
        try {
            const id = __query.id;
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'read', resource: 'student'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const student = {id};
            let result = await this.validators.student.getStudent(student);
            if(result) return result;

            const studentExists = await this.mongomodels.student.findById(id);
            if(!studentExists) return {error: 'student not found', status: 404, ok: false};

            return {
                student: studentExists
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAll({__longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'create', resource: 'student'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const students = await this.mongomodels.student.find({});
            return {
                students
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}