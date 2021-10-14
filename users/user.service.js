﻿const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('app/db');

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    getUserByNames,
    delete: _delete
};

async function authenticate(params) {
    let user = await db.User.scope('withHash').findOne({ where: {} });
    if(params.userName.includes("@")){
        user = await db.User.scope('withHash').findOne({ where: {  emailAddress: params.userName } });
        console.log("new USER: "+user);
    }else{
        user = await db.User.scope('withHash').findOne({ where: {  userName: params.userName } });
    }
    
    if (!user || !(await bcrypt.compare(params.password, user.hash)))
        throw 'Username or password is incorrect';

    // authentication successful
    const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
    return { ...omitHash(user.get()), token };
}

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    console.log("params::: "+params);
    // validate 
    if (await db.User.findOne({ where: { userName: params.userName } })) {
        throw 'Username "' + params.userName + '" is already taken';
    }

    if (await db.User.findOne({ where: { emailAddress: params.emailAddress } })) {
        throw 'Email Address "' + params.emailAddress + '" is already taken';
    }

    // hash password
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // validate
    const usernameChanged = params.userName && user.userName !== params.userName;
    if (usernameChanged && await db.User.findOne({ where: { userName: params.userName } })) {
        throw 'Username "' + params.userName + '" is already taken';
    }

    const emailAddressChanged = params.emailAddress && user.emailAddress !== params.emailAddress;
    if (emailAddressChanged && await db.User.findOne({ where: { emailAddress: params.emailAddress } })) {
        throw 'Email Address "' + params.emailAddress + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// helper functions

async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

async function getUserByNames({ emailAddress, userName }) {
    const user = await db.User.findOne({ where: { emailAddress: emailAddress, userName: userName } });
    console.log(user);
    return user;
}