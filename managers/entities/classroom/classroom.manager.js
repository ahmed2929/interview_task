module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.userExposed         = ['create'];
        this.httpExposed         = ["post=create","put=update","delete=delete","get=getByID","get=getAll"];
        this.name                = "school";
        this.managers            = managers;

    }

    async create({name, capacity,schoolId, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'create', resource: 'classroom'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const classroom = {name, capacity, schoolId};
            let result = await this.validators.classroom.createClassRoom(classroom);
            if(result) return result;

            // Check if exists
            let exists = await this.mongomodels.classroom.findOne({name});
            if(exists) return {error: 'classroom already exists', status: 409,ok: false};
            // check for school
            const school=await this.mongomodels.school.findById(schoolId)
            if(!school) return {error: 'school not found', status: 404,ok: false};
            // Creation Logic
            let createdClassroom    = await this.mongomodels.classroom.create({name,capacity,schoolId})            
            // Response
            return {
                classroom: {
                    name: createdClassroom.name,
                    capacity: createdClassroom.capacity,
                    id: createdClassroom._id,
                    schoolId: createdClassroom.schoolId
                } 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async update({name, capacity,id,schoolId, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'update', resource: 'classroom'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const classroom = {name, capacity, schoolId,id};
            let result = await this.validators.classroom.updateClassroom(classroom);
            if(result) return result;
            const classExists=await this.mongomodels.classroom.findById(id)
            if(!classExists) return {error: 'classroom not found', status: 404,ok: false};
            // Check if exists
            let exists = await this.mongomodels.classroom.findOne({name, _id: {$ne: id}});
            if(exists) return {error: 'classroom already exists', status: 409,ok: false};
            // check for school
            const school=await this.mongomodels.school.findById(schoolId)
            if(!school) return {error: 'school not found', status: 404,ok: false};
            // Creation Logic
            let createdClassroom    = await this.mongomodels.classroom.findByIdAndUpdate(id,
                { name, capacity ,schoolId},
               )          
            // Response
            return {
                classroom: {
                    name: createdClassroom.name,
                    capacity: createdClassroom.capacity,
                    id: createdClassroom._id,
                    schoolId: createdClassroom.schoolId
                } 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async delete({__query, __longToken}){
        try {
            const id = __query.id;
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'delete', resource: 'classroom'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const classroom = {id};

            let result = await this.validators.classroom.deleteClassroom(classroom);
            if(result) return result;

            // Check if exists
            let exists = await this.mongomodels.classroom.findById(id);
            if(!exists) return {error: 'school not found', status: 404,ok: false};
            
            // Creation Logic
            let deletedClassroom = await this.mongomodels.classroom.findByIdAndDelete(id)            
            // Response
            return {
                classroom:deletedClassroom
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async getByID({__longToken, __query}){
        try {
            const id = __query.id;

            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'read', resource: 'classroom'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
          
            const classroom = {id};

            let result = await this.validators.classroom.getClassroom(classroom);
            if(result) return result;

            // Check if exists
            let classroomExists = await this.mongomodels.classroom.findById(id);
            if(!classroomExists) return {error: 'classroom not found', status: 404,ok: false};
            
            return {
                classroom: classroomExists
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async getAll({__longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'read', resource: 'classroom'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            // Check if exists
            let classrooms = await this.mongomodels.classroom.find({});            
            return {
                classrooms
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
}
