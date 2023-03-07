const Art = require('../models/item');
const model = require('../models/user');
const watchList = require('../models/interest');
const tradem = require('../models/trade');
const { DateTime } = require("luxon");

exports.index = (req, res, next) => {
    let categories = [];
    Art.distinct("artstyle", function(error, results){
        categories = results;
    });
    Art.find()
    .then(arts => res.render('./story/trades', {arts, categories}))
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./story/newTrade');
};

exports.create = (req, res, next) => {
    let art = new Art(req.body);//create a new connection document
    art.owner = req.session.user;
    art.status = "available";
    console.log(art);
    art.save()//insert the document to the database
    .then(arts=> {
        req.flash('success', 'You have successfully created a new Art');
        res.redirect('/trades');
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};

exports.show = (req, res, next) => {
    let id = req.params.id;

    Art.findById(id).populate('owner', 'firstName lastName')
    .then(art=>{
        if(art) {
            let watch = false;
            let uid = req.session.user;
            watchList.findOne({uname: uid, mnames: id})
            .then(w => {
                if(w)
                {
                    watch = true;
                    art.createAt = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT);
                    //console.log("w"+ watch)
                    return res.render('./story/show', {art, w});
                }
                else{
                    art.createAt = DateTime.now().toLocaleString(DateTime.DATETIME_SHORT);
                    return res.render('./story/show', {art, w});
                }
            })
            .catch(err =>next(err));    
            
        } else {
            let err = new Error('Cannot find an art with id:  ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    Art.findById(id)
    .then(art=>{
        if(art) {
            return res.render('./story/edit', {art});
        } else {
            let err = new Error('Cannot find an art with id:  ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next) => {
    let art = req.body;
    let id = req.params.id;
    Art.findByIdAndUpdate(id, art, {useFindAndModify: false, runValidators: true})
    .then(art=>{
        if(art) {
            req.flash('success', 'Art has been successfully updated');
            res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find an art with id:  ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            res.redirect('back');
        }else{
            next(err);
        }
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    //console.log(id)
    tradem.findOne({offerid:id})
    .then(result=>{
        if(result){
        Art.findOneAndUpdate({_id:result.tradeid},{status:'available'})
        .then(r=>{})
        .catch(err=> next(err));
        console.log(result)
        }
    })
    .catch(err =>next(err));

    tradem.findOne({tradeid:id})
    .then(result=>{
        if(result){
        Art.findOneAndUpdate({_id:result.offerid},{status:'available'})
        .then(r=>{})
        .catch(err=> next(err));
        console.log(result)
        }
    })
    .catch(err =>next(err));


    tradem.findOneAndDelete({offerid:id})
    .then(result=>{
        if(result){
            console.log("Trade details r deleted")
        }
        else{
            tradem.findOneAndDelete({tradeid:id})
            .then(art=>{
                if(art) {
                    console.log("Trade details s deleted")
                }
        })
            .catch(err=>next(err))
        }

    })
    .catch(err=>next(err));

    watchList.findOneAndDelete({mnames:id})
    .then(result =>{
        console.log("Watchlist is deleted")
    })
    .catch(err=> next(err)); 

    Art.findByIdAndDelete(id, {useFindAndModify: false})
    .then(art =>{
        if(art) {
            req.flash('success', 'Art has been successfully deleted');
            res.redirect('/trades');
        } else {
            let err = new Error('Cannot find an art with id:  ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
    //res.redirect('/');
};

exports.interested = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    watchList.findOne({uname:uid})
    .then(user => {
        if(user){
            watchList.updateOne({uname: uid},
                {$push: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                });    
                console.log("Updated")            
        }
        else{
            let addwlist = new watchList({uname: uid, mnames: [mid]});
            addwlist.save();
        }
    })
    .catch(err=>next(err));
    res.redirect('/users/profile');    
};


exports.notinterested = (req, res, next) => {
    let mid = req.params.id;
    let uid = req.session.user;
    watchList.findOne({uname:uid})
    .then(user => {
        if(user){
            watchList.updateOne({uname: uid},
                {$pullAll: {mnames:[mid]}}, 
                function(err){
                    if(err){
                        return next(err);
                    }
                    else{
                        watchList.findOne({uname:uid})
                        .then(result=>{
                            if(result){
                                if(result.mnames.length === 0){
                                watchList.findOneAndDelete({uname:uid})
                                .then(result =>{
                                    console.log("Watchlist deleted")
                                })
                                .catch(err=> next(err)); 
                            }
                            }
                        })
                        .catch(err=>next(err))
                    }
                });   
        }
    })
    .catch(err=>next(err));
   
    res.redirect('back');   
};

exports.tradeitem = (req, res, next) => {
let omid = req.params.id;
let uid = req.session.user;
Promise.all([model.findById(uid), Art.find({owner: uid})])
.then(results => {
    let a = true;
    const [user, arts] = results;
    res.render('./story/tradeart', {user, arts,omid })
})
.catch(err=> next(err));
}


exports.tradeoffered =(req, res, next) => {
    let omid = req.params.id;
    let tmid = req.body;
    let uid = req.session.user;
    let tmid1 = tmid.item
    console.log(omid);
    tradem.findOne({tradeid:omid}, {offerid: tmid1})
    .then(a=>{
    if(!a)
    {
        let newtrade = new tradem();
        newtrade.traderid = uid;
        newtrade.tradeid = omid;
        newtrade.offerid = tmid1
        Art.findOneAndUpdate({_id:omid}, {status: "offer pending"})
        .then(r=>{
        })
        .catch(err=> next(err));
        Art.findOneAndUpdate({_id:tmid1}, {status: "offer pending"})
        .then(r=>{
        })
        .catch(err=> next(err));
        newtrade.save();
        req.flash('success', 'Trade has been succesfully offered');
        res.redirect('/users/profile');
    }
    else{
        console.log("Art already in trade");
        res.redirect('/trades');
    }
    
})
    .catch(err=> next(err));
}

exports.offercancel = (req, res, next) => {
    let mid = req.params.id;
    console.log(mid);

    tradem.findOneAndDelete({tradeid:mid})
    .then(r=>{
        //console.log(r)
        const oid = r.offerid
        const tid = r.tradeid
        Art.findOneAndUpdate({_id:oid}, {status: "available"})
        .then(r=>{
            //console.log(r)
        })
        .catch(err=> next(err));
        Art.findOneAndUpdate({_id:tid}, {status: "available"})
        .then(r=>{
            //console.log(r)
        })
        .catch(err=> next(err));
        //console.log("TD: "+r.traderid)
        req.flash('success', 'Offer has been successfully canceled');
        res.redirect('/users/profile');
    })
}

exports.manageOffer= (req, res, next) => {
    let tid= req.params.id;
    console.log(tid)
    let r = true
     tradem.findOne({offerid:tid}).populate('tradeid').populate('offerid')
     .then(result =>{
         if(result){
         console.log(result)
         res.render('./story/manageOffer',{r,result})
         }
         else{
             r = false;
             //console.log(r)
             tradem.findOne({tradeid:tid}).populate('tradeid').populate('offerid')
             .then(result=>{
                res.render('./story/manageOffer',{r,result})
             })
             .catch(err=> next(err));
             
         }
     })
     .catch(err =>next(err));
}

exports.acceptOffer = (req, res, next) => {
    let tid = req.params.id;
    console.log(Art);
    Art.findByIdAndUpdate(tid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then(art =>{
        if(art) {
            req.flash('success', 'Art has been successfully updated');
            //res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find an art with id:  ' + tid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));


    tradem.findOne({tradeid:tid}).populate('offerid')
    .then(result=>{

        oid = result.offerid.id
        console.log(oid)
        Art.findByIdAndUpdate(oid,{status: "traded"},{useFindAndModify: false, runValidators: true})
    .then(art =>{
        if(art) {
            req.flash('success', 'Art has been successfully updated');
            //res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find an art with id:  ' + oid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    tradem.findOneAndDelete({tradeid:tid})
    .then(result=>{
        if(result){
            req.flash('success', 'Offer has been Accepted');
            res.redirect("/users/profile")
        }
    })
    .catch(err=> next(err));
    
})
    .catch(err=> next(err));
    
}

exports.rejectOffer = (req, res, next) => {
    let tid = req.params.id;
    console.log(tid);
    Art.findByIdAndUpdate(tid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then(art =>{
        if(art) {
            req.flash('success', 'Art has been successfully updated');
            //res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find an art with id:  ' + tid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    
    tradem.findOne({tradeid:tid}).populate('offerid')
    .then(result=>{
        oid = result.offerid.id
        Art.findByIdAndUpdate(oid,{status: "available"},{useFindAndModify: false, runValidators: true})
    .then(art =>{
        if(art) {
            req.flash('success', 'Art has been successfully updated');
        } else {
            let err = new Error('Cannot find an art with id:  ' + oid);
            err.status = 404;
            next(err);
        }
})
    .catch(err=> next(err));
    tradem.findOneAndDelete({tradeid:tid})
    .then(result=>{
        req.flash('success', 'Offer has been Rejected');
        res.redirect("/users/profile")
    })
    .catch(err => next(err));
    })
    .catch(err=> next(err));
    
}