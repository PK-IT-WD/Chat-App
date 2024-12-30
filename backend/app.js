const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const {Sequelize, DataTypes} = require('sequelize');
const app = express();

app.use(express.static(path.join(__dirname, '../', 'frontend')));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST']
}));

const sequelize = new Sequelize('chatApp', 'root', '2001', {
    host: 'localhost',
    dialect: 'mysql'
});

sequelize.authenticate()
.then(() => {
    console.log('Backend connected with Database');
})
.catch(err => {
    console.error('Database connection error:', err);
});

const userDetails = sequelize.define('userDetails', {
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

sequelize.sync({alter: true})
.then(() => {
    console.log('Database Table created');
})
.catch(err => {
    console.error('Table creation on the Database error:', err);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'frontend', 'index.html'));
});

app.post('/signup', async (req, res) => {
    const {userName, email, mobileNumber, password} = req.body
    try {
        const available = await userDetails.findOne({where: {email: email, mobileNumber: mobileNumber}});
        if (!available) {
            const saltRounds = 10
            const hashPassword = await bcrypt.hash(password, saltRounds);

            await userDetails.create({
                userName: userName,
                email: email,
                mobileNumber: mobileNumber,
                password: hashPassword
            });
            res.status(201).json({success: true, message: 'User credentials added successfully'})
        } else {
            res.status(409).json({success: false, message: 'User credentials already present'});
        }
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({success: false, message: 'Server error'});
    }
})

app.listen(3000, ()=> {
    console.log('Server is running on the port 3001');
});