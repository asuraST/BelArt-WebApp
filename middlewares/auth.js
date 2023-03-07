const Art = require('../models/item');

//check if user is a guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to log in first');
        return res.redirect('/users/login');
    }
};

//check if user is host of the connection
exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    Art.findById(id)
    .then(art => {
        if(art){
            if(art.owner == req.session.user){
                return next();
            } else {
                req.flash('error','Unauthorized access to the resource');
                return res.redirect('/');
            }
        }else {
            let err = new Error('Cannot find a connection with id ' + req.params.id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};