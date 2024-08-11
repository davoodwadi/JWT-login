import {getDB, getUser, addUser, getAllMatchingUsers, getLatestSession, updateInfo, addSaveContainer, id2User} from './mongo.js';

export async function load(req, res) {
    console.log('calling from outside')
    try {
        const askedUserName = req.body.username;
        const askedPassword = req.body.password;

        const user = await getUser(askedUserName);
        
        if (!user) {
            res.json('User not found. Please login.');
        } else if (user.password === askedPassword) {
            const latest = await getLatestSession(askedUserName)
            console.log('loading latest session')
            console.log(latest)
            
            res.json(latest)
        } else {
            res.json('Not allowed');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

export async function save(req, res) {
    try {
        const askedUserName = req.body.username;
        const askedPassword = req.body.password;
        const saveContainer = req.body.saveContainer

        const user = await getUser(askedUserName);
        
        if (!user) {
            res.json('User not found. Please login.');
        } else if (user.password === askedPassword) {
            await addSaveContainer(askedUserName, saveContainer);
            console.log('adding saveContainer')
            console.log(saveContainer)
            
            const updatedUser = await getUser(user.username)
            
            res.json(updatedUser)
        } else {
            res.json('Not allowed');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

export async function signup (req, res) {
    try {
        const newUserName = req.body.username
        const newPassword = req.body.password

        // check if username exists
        const userExists = await getUser(newUserName)
        if (userExists){
            res.json('the username already exists.')
        } else {
            // add user to db
            await addUser(newUserName, newPassword)
            const newUserEntry = await getUser(newUserName)
            req.session.userId = newUserEntry._id;  // Store user ID in the session
            // req.session.cookie.userId = user._id;  // Store user ID in the session
            console.log(req.session)
            res.send(req.session.userId)
        }

    } catch(error){
        console.log(error)
        res.status(500).send(error)
    }
}

export async function login(req, res) {
    try {
        const askedUserName = req.body.username;
        const askedPassword = req.body.password;
        const user = await getUser(askedUserName);
        
        if (!user) {
            res.json('User not found.');
        } else if (user.password === askedPassword) {
            await updateInfo(user.username, {lastLogin: new Date()})
            const updatedUser = await getUser(user.username)
            req.session.userId = updatedUser._id;  // Store user ID in the session
            console.log(req.session)
            // res.json('Correct');
            res.send(req.session.userId)
        } else {
            res.json('Not allowed');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

export function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.json('Logged out successfully.');
    });
};

export function authenticate(req, res, next) {
    console.log('*'.repeat(50))
    console.log('authenticate: req.session')
    console.log(req.session)
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized. Please log in.');
    }
};

export async function profile(req, res) {
    // Fetch user data using req.session.userId
    console.log('*'.repeat(50))
    console.log('Profile: req.session.userId')
    console.log(req.session.userId)
    const user = await id2User(req.session.userId)
    res.json(user);
};

export function test(req, res) {
    res.json(req.session);
}