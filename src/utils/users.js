
const users = [];

//addUser

const addUser = ({id,username,room}) =>{
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if(!username || !room){
        return {
            error:"Username and room are required"
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error:'Username is in use'
        }
    }

    //Store user
    const user = {id,username,room};
    users.push(user);
    return {user}

};


//Remove a user
const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }
};

//getUser
const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id;
    });


    return user
};

//getUsersInRoom
const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase();

    const userList = users.filter((user)=>{
        return user.room === room;
    });

    if(!userList){
        return []
    }

    return userList

};

module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};