import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const mongoPassword = process.env.mongoPassword
const uri = "mongodb+srv://davoodwadi:<password>@cluster0.xv9un.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0".replace('<password>', mongoPassword)

let client;
const db = 'test';
const col = 'chatUsers';

function connectDB() {
    if (!client) {
        // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
        console.log('creating client to the DB')
        client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1, strict: true, deprecationErrors: true,}}); 
    }
    return client;
}

export function getDB(dbName, collectionName) {
    const client = connectDB();
    
    const db = client.db(dbName)
    const collection = db.collection(collectionName);
    return collection
} 
export async function getUser(username){
    const collection = getDB(db, col)
    try {
        console.log('looking for entry')
        const oneDoc = await collection.findOne({username: username})
        console.log('entry found')
        // console.log(oneDoc)
        return oneDoc
    
    } catch(error){
        console.log(error)
    } 
}

export async function id2User(id){
    const collection = getDB(db, col)
    try {
        console.log('looking for entry')
        if (!ObjectId.isValid(id)) {
            throw new Error("Invalid ObjectId");
        }
        const objId = new ObjectId(id)
        console.log(objId)
        const oneDoc = await collection.findOne({ _id: objId })
        console.log('entry found')
        console.log(oneDoc)
        return oneDoc
    
    } catch(error){
        console.log(error)
    } 
}

export async function getAllMatchingUsers(username){
    const collection = getDB(db, col)
    // Print a message if no documents were found
    if ((await collection.countDocuments({username: username})) === 0) {
        console.log("No documents found!");
    } else {
        const allDocs = collection.find({username: username})
        // console.log(allDocs)
        for await(const doc of allDocs){
            console.log('*'.repeat(50))
            console.log(doc)
            console.log('*'.repeat(50))
        }
    }
}

export async function addUser(username, password){
    try {
        const collection = getDB(db, col)
        if ((await collection.countDocuments({username: username})) !== 0) {
            console.log("user already exists");
        } else {
            const resp = await collection.insertOne({
                username: username,
                password: password,
                sessions: []
            })
            console.log("success:\n", resp);
        }
    } catch (error){
        console.log('myError: ', error)
      }
}

export async function updateInfo(username, update){
    try {
        const collection = getDB(db, col)
        if ((await collection.countDocuments({username: username})) === 0) {
            console.log("user doesn't exist");
        } else {
                // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: update,
            };
            const result = await collection.updateOne({username: username}, updateDoc);
            console.log("update success:\n", result.modifiedCount);
        }
    } catch (error){
        console.log('myError: ', error)
      }
}
export async function getLatestSession(username) {
    try {
        const collection = getDB(db, col)

        const user = await collection.findOne(
            { username: username },
            { 
                projection: { sessions: { $slice: -1 } } // Get the last session
            }
        );

        if (user && user.sessions.length > 0) {
            console.log("Latest session: ", user.sessions[0]);
            return user.sessions[0]; // Return the latest session
        } else {
            console.log("No sessions found for this user");
        }
    } catch (error) {
        console.log('myError: ', error);
    }
}
export async function addSaveContainer(username, update){
    try {
        const collection = getDB(db, col)
        if ((await collection.countDocuments({username: username})) === 0) {
            console.log("user doesn't exist");
        } else {
                // Specify the update to set a value for the plot field
            const updateDoc = {
                $push: { sessions: {time: new Date(), saveContainer: update}, // Use $push to add to the array
            }};
            const result = await collection.updateOne({username: username}, updateDoc);
            console.log("update success:\n", result.modifiedCount);
        }
    } catch (error){
        console.log('myError: ', error)
      }
}

