module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.httpExposed         = ['post=createUser','post=login'];
        this.name                = "user";
        this.managers            = managers;

    }

    async createUser({username, password,role,schoolId, __longToken}){
        try {
            const userRole = __longToken?.role;
            const isAuthorized = this.managers.authorization.isAuthorized({userRole, action: 'create', resource: 'user'});
            if(!isAuthorized) return {error: 'Unauthorized', status: 401, ok: false};
            const user = {username, password, role,schoolId};

            let result = await this.validators.user.createUser(user);
            if(result) return result;
            // check for schoolId incase of school admin
            if(role === 'schoolAdmin' && !schoolId) return {error: 'School Id is required', status: 400, ok: false};
            if(role === 'schoolAdmin'){
                let school = await this.mongomodels.school.findById(schoolId);
                if(!school) return {error: 'School not found', status: 404, ok: false};
            }
            // Check if user exists
            let userExists = await this.mongomodels.user.findOne({username});
            if(userExists) return {error: 'User already exists', status: 409,ok: false};
            
            // Creation Logic
            let createdUser     = await this.mongomodels.user.create({username, role, password, school: schoolId});
            let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, role: createdUser.role,schoolId});
            
            // Response
            return {
                user: {
                    username: createdUser.username,
                    role: createdUser.role,
                    id: createdUser._id
                }, 
                longToken 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }

    async login({username, password}){
        try {
            const user = {username, password};
            let result = await this.validators.user.login(user);
            if(result) return result;
            // Check if user exists
            let userExists = await this.mongomodels.user.findOne({username});
            if(!userExists) return {error: 'User not found', status: 404,ok: false};
            // Check if password is correct
            let passwordMatch = await userExists.comparePassword(password);
            if(!passwordMatch) return {error: 'Invalid password', status: 401,ok: false};
            // Creation Logic
            let longToken       = this.tokenManager.genLongToken({userId: userExists._id, role: userExists.role,schoolId: userExists.school});
            // Response
            return {
                user: {
                    username: userExists.username,
                    role: userExists.role,
                    id: userExists._id
                }, 
                longToken 
            };
        } catch (error) {
            console.log(error)
            throw error;
        }
     
    }

}
