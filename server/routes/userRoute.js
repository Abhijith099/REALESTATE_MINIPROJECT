import express from 'express';
import { allBookings, bookVisit, cancelBooking, createUser, getallFavorites, toFav } from '../controllers/userCntrl.js';
import jwtCheck from '../config/auth0Config.js';

const router = express.Router(); 


router.post('/register',jwtCheck ,createUser);
router.post("/bookVisit/:id",jwtCheck,bookVisit);
router.post("/allBookings",jwtCheck,allBookings);
router.post("/removeBooking/:id",jwtCheck,cancelBooking);
router.post("/toFav/:rid",jwtCheck,toFav);
router.post("/allFav",jwtCheck,getallFavorites);


export {router as userRoute}