const usermodel = require('../Model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



async function registerUser(req, res){
    try {
        const { Fullname, Email, Password, Phone } = req.body;

    // Validation checks
    if (!Fullname || !Email || !Password || !Phone) {
        return res.status(400).json({
            message: "All fields (Fullname, Email, Password, Phone) are required"
        });
    }

    // Validate Full Name
    if (Fullname.trim().length < 3) {
        return res.status(400).json({
            message: "Full name must be at least 3 characters long"
        });
    }

    // Validate Email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).json({
            message: "Please provide a valid email address"
        });
    }

    // Validate Phone (10 digits only)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(Phone)) {
        return res.status(400).json({
            message: "Phone number must be exactly 10 digits"
        });
    }

    // Validate Password
    if (Password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long"
        });
    }

    const isUserExist = await usermodel.findOne({
        Email
    });

    if(isUserExist) {
        return res.status(400).json({
            message: "User already exists with this email, Please login"
       });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newuser = await usermodel.create({
        Fullname: Fullname,
        Email: Email,
        Phone: Phone,
        Password: hashedPassword
    });

    const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, { expiresIn: '12h' }); //token generated and valid for 12 hours

    res.cookie('token', token);
       
        return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: newuser._id,
            Email,
            Fullname,
            Phone
        }
    })
    } catch (err) {
        console.error('registerUser error', err);
        return res.status(500).json({ message: 'Server error while registering user' });
    }
}

const loginUser = async (req, res) => {
    try {
        // accept both 'Email'/'email' and 'password'/'Password'
        const rawBody = req.body || {};
        const Email = rawBody.Email || rawBody.email;
        const password = rawBody.password || rawBody.Password;

        // Basic validation
        if (!Email || !password) {
            console.warn('loginUser: missing credentials in request body', { hasBody: !!req.body, keys: Object.keys(req.body || {}) });
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await usermodel.findOne({ Email: Email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        // Ensure password stored
        if (!user.Password) {
            console.warn(`loginUser warning: user ${Email} has no password in DB`);
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(String(password), String(user.Password));

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('loginUser error: JWT_SECRET is not set in environment');
            return res.status(500).json({ message: 'Server misconfiguration (missing JWT_SECRET)' });
        }

        // Generate token
        let token;
        try {
            token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
        } catch (err) {
            console.error('loginUser jwt.sign error', err);
            return res.status(500).json({ message: 'Server error creating session token' });
        }

        res.cookie('token', token);

        return res.status(200).json({
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                Email: user.Email,
                Fullname: user.Fullname,
            },
        });
    } catch (err) {
        console.error('loginUser error', err && err.stack ? err.stack : err);
        return res.status(500).json({ message: 'Server error while logging in' });
    }
};



module.exports = {
    registerUser,
    loginUser
}