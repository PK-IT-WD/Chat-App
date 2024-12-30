const express = require('express');
const path = require('path');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

const messageDetails = sequelize.define('messageDetails', {
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: userDetails,
            key: 'id'
        }
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

messageDetails.belongsTo(userDetails, {foreignKey: 'userID', as: 'userInfo'});
userDetails.hasMany(messageDetails, {foreignKey: 'userID', as: 'userInfo'});

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
            return res.status(201).json({success: true, message: 'User credentials added successfully'})
        }

        return res.status(409).json({success: false, message: 'User credentials already present'});
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await userDetails.findOne({where: {email: email}});
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            return res.status(401).json({success: false, message: 'Invalid credentials'});
        }

        const token = jwt.sign({userID: user.id}, 'secretKey', {expiresIn: '1h'});
        return res.status(200).json({success: true, message: 'User Login successfully', token});
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

app.post('/message', async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({success: false, message: 'Token not provided'});

    try {
        const {message} = req.body;
        const tokenParts = token.split(' ');
        const decodedToken = jwt.verify(tokenParts[1], 'secretKey');
        if (!decodedToken) return res.status(403).json({success: false, message: 'Invalid Token'});

        await messageDetails.create({
            userID : decodedToken.userID,
            message: message
        });
        const totalMessage = await messageDetails.findAll({
            include: [{
                model: userDetails,
                as: 'userInfo',
                attributes: ['userName']
            }]
        });
        console.log(JSON.stringify(totalMessage));
        return res.status(201).json({success: true, storedMessage: totalMessage});
    } catch (err) {
        console.log('Message Database Error:', err);
        res.status(500).json({success: false, message: 'Server error'});
    }
});

app.listen(3000, ()=> {
    console.log('Server is running on the port 3001');
});