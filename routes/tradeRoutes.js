const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const { isLoggedIn, isHost } = require('../middlewares/auth');
const { validateId, validateArt, validateResult} = require('../middlewares/validator'); 


//GET /connections: send all connections to the user
router.get('/', controller.index);

//GET /connections/new: send html form for creating a new connection
router.get('/new', isLoggedIn, controller.new);

//POST /connections: create a new connection
router.post('/', isLoggedIn, validateArt, validateResult, controller.create);

//GET /connections/:id: send details of connection identified by id
router.get('/:id', validateId, controller.show);

//GET /connections/:id: send html form for editing an existing connection
router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

//PUT /connections/:id: update the connection identified by id
router.put('/:id', validateId, isLoggedIn, isHost, validateArt, validateResult, controller.update);

//DELETE /connections/:id: delete the connection identified by id
router.delete('/:id', validateId, isLoggedIn, isHost, controller.delete);

router.post('/:id/interested', validateId, isLoggedIn, controller.interested);

router.post('/:id/notinterested', validateId, isLoggedIn, controller.notinterested);

router.post('/:id/tradeitem', validateId, isLoggedIn, controller.tradeitem);

router.post('/:id/tradeoffered',validateId, isLoggedIn, controller.tradeoffered);

router.post('/:id/offercancel', validateId, isLoggedIn, controller.offercancel);

router.post('/:id/manageOffer', validateId, isLoggedIn, controller.manageOffer);

router.post('/:id/acceptOffer', validateId, isLoggedIn, controller.acceptOffer);

router.post('/:id/rejectOffer', validateId, isLoggedIn, controller.rejectOffer);


module.exports=router;  