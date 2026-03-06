import {auth} from 'express-oauth2-jwt-bearer'

const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE, //changed
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,//changed
    
    tokenSigningAlg: "RS256"
})

export default jwtCheck