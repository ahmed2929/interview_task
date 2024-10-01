module.exports = class SchoolManager { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.httpExposed         = ["post=create","put=update","delete=delete","get=getByID","get=getAll"];
        this.name                = "school";
        this.managers            = managers;

    }

    async create({name, address, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'create', resource: 'school'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const school = {name, address};
            let result = await this.validators.school.createSchool(school);
            if(result) return result;

            // Check if exists
            let exists = await this.mongomodels.school.findOne({name});
            if(exists) return {error: 'school already exists', status: 409,ok: false};
            
            // Creation Logic
            let createdSchool     = await this.mongomodels.school.create({name,address})            
            // Response
            return {
                school: {
                    name: createdSchool.name,
                    address: createdSchool.address,
                    id: createdSchool._id
                } 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async update({name, address,id, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'update', resource: 'school'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const school = {name, address,id};

            let result = await this.validators.school.updateSchool(school);
            if(result) return result;

            // Check if exists
            let exists = await this.mongomodels.school.findById(id);
            if(!exists) return {error: 'school not found', status: 404,ok: false};

            let schoolExists = await this.mongomodels.school.findOne({ name, _id: { $ne: id } });
            if (schoolExists) return { error: 'school with this name already exists', status: 409, ok: false };
            
            // Creation Logic
            let School     = await this.mongomodels.school.findByIdAndUpdate(id,
                { name, address },
               )            
            // Response
            return {
                school: {
                    name: School.name,
                    address: School.address,
                    id: School._id
                } 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async delete({id, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'delete', resource: 'school'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const school = {id};

            let result = await this.validators.school.deleteSchool(school);
            if(result) return result;

            // Check if exists
            let exists = await this.mongomodels.school.findById(id);
            if(!exists) return {error: 'school not found', status: 404,ok: false};
            // Check if school has classrooms prevent deletion
            let classrooms = await this.mongomodels.classroom.find({schoolId: id});
            if(classrooms?.length > 0) return {error: 'school has classrooms, cannot be deleted', status: 409,ok: false};
            // Creation Logic
            let School     = await this.mongomodels.school.findByIdAndDelete(id)            
            // Response
            return {
                School
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
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'read', resource: 'school'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            if(userRole === 'schoolAdmin'){
                const schoolId = __longToken?.schoolId;
                if(id !== schoolId) return {error: 'Unauthorized', status: 401, ok: false};
            }
            const school = {id};

            let result = await this.validators.school.getSchool(school);
            if(result) return result;

            // Check if exists
            let School = await this.mongomodels.school.findById(id);
            if(!School) return {error: 'school not found', status: 404,ok: false};
            
            return {
                School
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
    async getAll({__longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'update', resource: 'school'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            // Check if exists
            let schools;
            if(userRole === 'schoolAdmin'){
                const schoolId = __longToken?.schoolId;
                schools = await this.mongomodels.school.find({_id: schoolId});
            }else{
                schools = await this.mongomodels.school.find({});  
            }
                       
            return {
                schools
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }
}
