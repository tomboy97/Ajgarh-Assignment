const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { client } = require('../service/db');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const secret_key = 'this is my secret key';

router.post('/addUser', (req,res) => {
    let {name, email, password} = req.body;
    console.log(req.body);
    const bpassword = bcrypt.hashSync(password, 10);
    console.log(bpassword);
    const query = {
        text: 'INSERT INTO userDetails(name, email, password) VALUES($1, $2, $3)',
        values: [name, email, bpassword],
    };
    client.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error inserting user.');
        } else {
            console.log('User inserted!');
            res.status(200).send('User inserted!');
        }
    });
});

router.get('/getUser', (req, res) => {
    client.query(`select * from public.userDetails;`, (err, result) => {
        if(err) throw err;
        res.status(200).send(result);
    })
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    console.log(req.body);
    let existingUser;
    let {rows} = await client.query(`select * from public.userDetails where email = '${email}';`);
    console.log(rows);
    if(rows.length > 0){
        existingUser = rows[0];
    } else{
        res.status(404).send("user not found!");
    }
    console.log(existingUser);
    let token;
    const passcodeMatch = await bcrypt.compare(password, existingUser.password);
    if(passcodeMatch){
        token = jwt.sign({id: existingUser.id, email: existingUser.email}, secret_key, {expiresIn: "1h"});
    }else{
        res.status(403).send("Password is not corect!");
    }
    console.log("token is", token);
    res.status(200).json({
        success: true,
        token: token,
        message: "User logged in!"
    });
});

router.patch("/updateDetails", auth, async (req, res) => {
    const {name, email, password} = req.body;
    const setClauses = [], values = [];
    const {id} = req.user;
    if (email) {
        setClauses.push('email = $' + (values.length + 1));
        values.push(email);
      }
      if (password) {
        setClauses.push('password = $' + (values.length + 1));
        values.push(password);
      }
      if (name) {
        setClauses.push('name = $' + (values.length + 1));
        values.push(name);
      }
    
      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
    
      const updateQuery = {
        text: `UPDATE public.userDetails SET ${setClauses.join(', ')} WHERE id = $${values.length + 1}`,
        values: [...values, id],
      };
    
      try {
        const result = await client.query(updateQuery);
        res.status(200).json({ message: 'User details updated' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred' });
      }
});

router.delete('/deleteUser', auth, async (req, res) => {
    const {id} = req.user;
    await client.query(`delete from public.userDetails where id = ${id}`, (err, result) => {
        if(err) throw err;
        res.status(200).send("User Deleted!");
    })
});

module.exports = {router};