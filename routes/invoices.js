const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

router.get('/',async function(req,res,next){
    try {
        const result = await db.query('select id, comp_code from invoices order by id');
        return res.json({'invoices':result.rows});
    }
    catch(err) {
        return next(err);
    }
});

router.get('/:id',async function(req, res, next) {
    try {
        let id = req.params.id;
        const result = await db.query(
            'select i.id,i.comp_code,i.amt,i.paid,i.add_date,i.paid_data,c.name,c.description from invoices as i inner join companies as c on (i.comp_code = c.doee) where id = $1',[id]);
            if(!result.rows.length){
                throw new ExpressError(`no such invoice: ${id}`,404);
            }
            const data = result.rows[0];
            const invoice = {
                id: data.id,
                company: {
                    code:data.comp_code,
                    name:data.name,
                    description:data.description,
                },
                amt:data.amt,
                paid:data.paid,
                add_date:data.add_date,
                paid_date:data.paid_date
            };
            return res.json({'invoice':invoice});
        }        
        catch(err){
            return next(err);
        }
    
});


router.post('/',async function(req,res,next){
    try {
        let {comp_code,amt} = req.body;
        const result = await db.query('insert into invoices (comp_code,amt) values ($1,$2) returning id, comp_code, amt, paid, add_date, paid_date',[comp_code,amt]);
        return res.json({'invoice':result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});

router.put('/:id',async function(req,res,next){
    try {
        let {amt,paid} = req.body;
        let id = req.params.id;
        let paidDate = null;

        const currResult = await db.query(
            'select paid from invoices where id = $1',[id]
        );

        if(!currResult.rows.length){
            throw new ExpressError(`no such invoice: ${id},404`);
        }

        const currPaidDate = currResult.rows[0].paid_date;

        if(!currPaidDate && paid){
            paidDate = new Date();
        } else if (!paid){
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }
        const result = await db.query('update invoices set amt=$1, paid=$2, paid_date = $3 where id=$4 returning id, comp_code, amt, paid, add_date, paid_date'[amt,paid,paidDate,id]);
        return res.json({'invoice':result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});

router.delete('/:id',async function(req,res,next) {
    try {
        let id=req.params.id;
        const result = await db.query(
            'delete from invoices where id = $1 returning id',[id]
        );
        if(!result.rows.length){
            throw new ExpressError(`no such invoice: ${id}`,404)
        }
        return res.json({'status':'deleted'});
    }
    catch (err) {
        return next(err);
    }
});

module.exports = router;