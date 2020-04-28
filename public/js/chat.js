//create socket
const socket = io(); //initiates socket connection

//elements
const $messageForm = document.getElementById('message_form');
const $messageFormInput = document.getElementById('message_field');
const $messageFormButton = document.getElementById('message_button');
const $locationButton = document.getElementById('send_location');
const $messages = document.getElementById('messages');

//templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//Parses url string to retrieve query data
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true});

//Controls auto-scrolling behaviour
const autoscroll = ()=>{
    $messages.scrollTop = $messages.scrollHeight
    // //New message element
    // const $newMessage = $messages.lastElementChild;
    //
    // //Height of the last message
    // const newMessageStyles = getComputedStyle($newMessage);
    // const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    // const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //
    // //visible height
    // const visibleHeight = $messages.offsetHeight;
    //
    // //Height of messages container
    // const containerHeight = $messages.scrollHeight;
    //
    // //How far have I scrolled?
    // const scrollOffset = $messages.scrollTop + visibleHeight;
    //
    // if(containerHeight - newMessageHeight <= scrollOffset){
    //     $messages.scrollTop = $messages.scrollHeight
    // }
    //
    // console.log(newMessageStyles)


};

//Receives connection acknowledgement and messages from server, which it renders to screen
socket.on('message', (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        username:message.username,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
});

//Recieves location string from server
socket.on('locationString',(url)=>{
    console.log(url);
    const html = Mustache.render(locationTemplate,{
        url:url.text,
        username:url.username,
        createdAt:moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
});

//Room data
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.getElementById('sidebar').innerHTML = html
});

//Sends messages to server
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable submit button
    $messageFormButton.setAttribute('disabled','disabled');


    //const message = document.getElementById('message_field').value;
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message,(error)=>{

        //enable submit button, clear input field and set focus
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        //Prints error message if message contains profanity
        if(error){
            return console.log(error)
        }

        //Acknowledges message delivered
        console.log('Message delivered')
    })
});

//Sends location to server
$locationButton.addEventListener('click', ()=>{
    //disable button
    $locationButton.setAttribute('disabled','disabled');

    //Check if geolocation exists and alert when it doesn't
    if(!navigator.geolocation){
        //enables location button
        $locationButton.removeAttribute('disabled');
        socket.emit('sendLocation','Private');
        return alert('Geolocation is not supported by your browser')
    }


    //Gets location from browser api and emits it to the server
    navigator.geolocation.getCurrentPosition((position)=>{
        //location object
        const location = {
            long: position.coords.longitude,
            lat: position.coords.latitude
        };
        //emits location to server
        socket.emit('sendLocation',location, (error)=>{
            //Enables button
            $locationButton.removeAttribute('disabled');
            //if location doesn't exists throws an error
            if(error){
                return console.log(error)
            }
            //Acknowledges location shared
            console.log('Location shared ')
        })
    })
});

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }

    console.log(username + 'joined')
});