const express = require("express");
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

router.get('/',async function(req, res, next){
    try {
        const result = await db.query(
            'select code, name from companies order by name'
        );
        return res.json({'companies':result.rows});
    }
    catch (err){
        return next(err);
    }
})

router.get('/:code',async function(req, res, next){
    try {
        let code = req.params.code;
        const compResult = await db.query(
            'select code, name, description from companies where code = $1',[code]
        );
        const invResult = await db.query(
            'select id from invoices where comp_code = $1',[code]
        );
        if(!compResult.rows.length){
            throw new ExpressError(`no such company: ${code}`,404)
        }
        const company = compResult.rows[0];
        const invoices = invResult.rows;
        company.invoices = invoices.map(inv => inv.id);
        return res.json({'company':company});
    }
    catch (err) {
        return next(err);
    }
});

router.post('/',async function(req,res,next){
    try {
        let {name,description} = req.body;
        
        const result = await db.query(
            'insert into companies (name, description), values($1,$2) returning name, description', [name,description]
        )
        return res.status(201).json({'company':result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});

router.put('/:code',async function(req,res,next){
    try {
        let {name,description} = req.body;
        let code = req.params.code;
        const result = await db.query('update companies set name=$1, description = $2 where code = $3 returning code,name,description',[name,description,code]);
        if(!result.rows.length){
            throw new ExpressError(`no such company: ${code}`,404)
        } else {
            return res.json({'company':result.rows[0]});
        }
    }
    catch(err) {
        return next(err);
    }
});

router.delete('/:code', async function(req,res,next){
    try{
        let code = req.params.code;
        const result = await db.query('delete from companies where code=$1 returning code',[code]);
        if(!result.rows.length){
            throw new ExpressError(`no such company: ${code}`,404)
        } else {
            return res.json({'status':'deleted'});
        }
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;