module.exports = ({ meta, config, managers }) =>{
    return ({req, res, next})=>{
        let authToken = req.headers.authorization || req.headers.token;
        if (authToken && authToken.startsWith('Bearer ')) {
            authToken=authToken.split(' ')[1];
        }
        if(!authToken){
            console.log('token required but not found')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }
        let decoded = null;
        try {
            console.log('decoding token')
            decoded = managers.token.verifyLongToken({token: authToken});
            if(!decoded){
                console.log('failed to decode-1')
                return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
            };
        } catch(err){
            console.log('failed to decode-2')
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'unauthorized'});
        }
        next(decoded);
    }
}