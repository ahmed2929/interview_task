module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.userExposed         = ['createUser'];
        this.httpExposed         = ['post=createUser'];
        this.name                = "user";

    }

    async createUser({username, password,role, __longToken}){
        try {
            const userRole = __longToken?.role;
            if(!userRole) return {error: 'Role not found', status: 400, ok: false};
            if(userRole !== 'superAdmin') return {error: 'Unauthorized', status: 401, ok: false};
            const user = {username, password, role};

            let result = await this.validators.user.createUser(user);
            if(result) return result;

            // Check if user exists
            let userExists = await this.mongomodels.user.findOne({username});
            if(userExists) return {error: 'User already exists', status: 409,ok: false};
            
            // Creation Logic
            let createdUser     = await this.mongomodels.user.create({username, role, password})
            let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, role: createdUser.role});
            
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

}
