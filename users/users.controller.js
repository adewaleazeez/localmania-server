const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('authorization/validate-request');
const authorize = require('authorization/authorize')
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);
router.post('/getuserbynames', authorize(), getUserByNamesSchema, getUserByNames);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        userName: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
    .then(user => res.json(user))
    .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        emailAddress: Joi.string().required(),
        userName: Joi.string().required(),
        password: Joi.string().min(6).required(),
        businessName: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        officeAddress: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
    .then(() => res.json({ message: 'Registration successful' }))
    .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
    .then(users => res.json(users))
    .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
    .then(user => res.json(user))
    .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        emailAddress: Joi.string().empty(''),
        userName: Joi.string().empty(''),
        password: Joi.string().min(6).empty(''),
        businessName: Joi.string().empty(''),
        phoneNumber: Joi.string().empty(''),
        officeAddress: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
    .then(user => res.json(user))
    .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
    .then(() => res.json({ message: 'User deleted successfully' }))
    .catch(next);
}

function getUserByNamesSchema(req, res, next) {
    const schema = Joi.object({
        userName: Joi.string().required(),
        emailAddress: Joi.string().required()
    });
    validateRequest(req, next, schema);
}
function getUserByNames(req, res, next) {
    userService.getUserByNames(req.body)
    .then(user => res.json(user))
    .catch(next);
}
