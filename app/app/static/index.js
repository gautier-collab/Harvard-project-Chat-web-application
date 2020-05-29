document.addEventListener('DOMContentLoaded', () => {

    // Conditions to render username page
    if (document.querySelector("#signIn") != null) {

        // Conditions for username submitting
        document.querySelector("#signIn").disabled = true;
        document.querySelector("#username").onkeyup = () => {

            // Check that input is not only made of whitespaces
            let counter = 0;
            for (let i = 0; i < document.querySelector("#username").value.length; i++) {
                let channelName = document.querySelector("#username").value;
                if (channelName.charAt(i) != " ") {
                    counter++;
                }
            }

            if (counter > 0) {
                document.querySelector('#signIn').disabled = false;
            }
            else
                document.querySelector('#signIn').disabled = true;
        };            

        // Log in
        document.querySelector("#signIn").onclick = () => {
            const username = document.querySelector('#username').value;
            localStorage.setItem('username', username);
            const index_url = document.querySelector('#URLs').dataset.indexurl;
            window.location.href = index_url;
            return false;
        };

    }

    else {

        // Conditions to render redirect to username page
        if (!localStorage.getItem('username')) {
            const username_url = document.querySelector('#URLs').dataset.usernameurl;
            window.location.href = username_url;
        }

        // Code to be executed if signed in
        else {
         
            // Reload the previous page that has been accessed and rendered after the 'back' button was pressed (otherwise python server is not reaccessed)
            if (localStorage.getItem("reload") === "yes") {
                localStorage.setItem("reload","no");
                location.reload();
            }

            var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

            document.querySelector("#user_name").innerHTML = localStorage.getItem('username');

            // Retrieve and display all the channels when the user arrives on the page (and only when he arrives)
            var request = new XMLHttpRequest();
            request.open('GET', '/channels');
            request.onload = () => {
                var data = JSON.parse(request.responseText);
                for (var key in data) {
                    var channelName = key;
                    var channelItem = document.createElement('li');
                    document.querySelector("ul").append(channelItem);
                    var link = document.createElement("a");
                    link.setAttribute('href', "javascript:;");
                    link.setAttribute('class',"nav-link");
                    // replace double quotes by &quot; in HTML string
                    link.setAttribute('onclick',`redirect("${channelName.replace('"',"/&quot;")}")`);
                    link.innerHTML = channelName;
                    channelItem.append(link);
                }
            };
            request.send();

            // Set links up to load new pages
            redirect = (pageName) => {

                // A channel should always has its history pushable when accessed from a button of the index page
                if (document.querySelector("h5") != null)
                    localStorage.setItem("pushable", "yes");

                pageName = pageName.replace("/&quot;",'"');
                document.title = pageName;
                localStorage.setItem("currentPage", pageName);
                if (document.querySelector("#send") != null) {
                    loadPage(pageName);
                }
                else {
                    window.location.href = document.querySelector('#URLs').dataset.channelurl.concat(pageName);
                }
                return false;
            };

            // Send newly submitted channel name to the server
            socket.on('connect', () => {
                submitChannel = () => {

                    // Following line removes the whitespaces on both ends of the string
                    newChannel = document.querySelector("#newChannel").value.trim();

                    // Retrieve all the channels to make sure the submitted name doesn't conflict with one already existing
                    var request = new XMLHttpRequest();
                    request.open('GET', '/channels');
                    request.onload = () => {
                        var data = JSON.parse(request.responseText);
                        for (var key in data) {
                            if (newChannel === key){
                                document.querySelector('#error').innerHTML="Sorry, a channel with the same name already exists.</br>";
                                return;
                            }
                        }
                        cancel();
                        socket.emit('create channel', {'name': newChannel});
                    };
                    request.send();

                };
            });

            // Add a channel when JSON is received from the server :
            socket.on('new channel', data => {
                var name = data.name;
                var channel = document.createElement("li");
                document.querySelector("ul").append(channel);
                var link = document.createElement("a");
                link.setAttribute('href', "javascript:;");
                link.setAttribute('class',"nav-link");
                link.setAttribute('onclick',`redirect("${name.replace('"',"/&quot;")}")`);
                link.innerHTML = name;
                $(channel).append(link);
                $(channel).hide().fadeIn(1700);
            });

            // Creating a channel (when the appropriate button is clicked)
            editChannel = () => {
                
                var template = Handlebars.compile(document.querySelector('#channelTemplate').innerHTML);
                document.querySelector("#createSpace").innerHTML = template({});

                // Conditions for channel submitting
                document.querySelector('#submitChannel').disabled = true;
                document.querySelector("#newChannel").onkeyup = () => {

                    //Check that input is not only made of whitespaces
                    let counter = 0;
                    for (let i = 0; i < document.querySelector("#newChannel").value.length; i++) {
                        let channelName = document.querySelector("#newChannel").value;
                        if (channelName.charAt(i) != " ") {
                            counter++;
                        }
                    }

                    if (counter > 0)
                    document.querySelector('#submitChannel').disabled = false;

                    else
                        document.querySelector('#submitChannel').disabled = true;

                };    

            };

            //Cancel channel creation
            cancel = () => {
                document.querySelector("#createSpace").innerHTML = "<button onclick='editChannel()'>Create a channel</button>";
                document.querySelector('#error').innerHTML="";
            };
            
            cancel();

            //Code to fill with leading zeros (in order to display timestamp):
            function zeroFill(number, width) {
              width -= number.toString().length;
              if ( width > 0 ) {
                return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
              }
              return number + ""; // always return a string
            }

            // Load previous page when the 'back' button is pressed
            window.onpopstate = e => {
                if (e.state != null) {
                    localStorage.setItem("pushable","no");
                    redirect(e.state.title);
                }
                else {
                    localStorage.setItem("reload","yes");
                    localStorage.setItem("pushable","no");
                    window.history.back();
                }
            };

            // Code to be executed everytime a channel is joined
            function loadPage(name) {
                var request = new XMLHttpRequest();
                request.open('GET', `/messages/${name}`);
                request.onload = () => {

                    document.querySelector("h3").innerHTML = "Current channel : ";
                    document.querySelector("h1").innerHTML = name;

                    // Push current state to URL (to allow using the 'back' button later on)
                    if (localStorage.getItem("pushable") === "no")
                        localStorage.setItem("pushable", "yes");
                    else {
                        history.pushState({"title": name}, name, name);
                    }

                    // Retrieve and display all the messages when the user arrives on the page
                    document.querySelector("#messages").innerHTML = "";
                    var data = JSON.parse(request.responseText);
                    for (var key in data) {
                        var msgSender = data[key]["sender"];
                        var msgContent = data[key]["content"];
                        var timestamp = new Date(data[key]["timestamp"]);
                        var picture = data[key]["picture"];
                        const header = document.createElement('div');

                        header.setAttribute("style","color:LightSlateGrey;");
                        const sender = document.createElement('b');
                        sender.innerHTML = `${msgSender}:`;
                        const time = document.createElement('i');
                        time.setAttribute("style",'font-size: 0.85em;');
                        time.innerHTML = `&nbsp; &nbsp; ${zeroFill(timestamp.getMonth()+1,2)}/${zeroFill(timestamp.getDate(),2)}/${timestamp.getFullYear()} at ${zeroFill(timestamp.getHours(),2)}:${zeroFill(timestamp.getMinutes(),2)}:${zeroFill(timestamp.getSeconds(),2)}`;
                        header.append(sender);
                        header.append(time);
                        var msg = document.createElement('div');
                        msg.append(header);
                        if (msgContent != "") {
                            msg.append(msgContent);
                            msg.append(document.createElement('br'));
                        }

                        if (picture != "") {
                            const image = document.createElement('img');
                            image.setAttribute("src",`${document.querySelector('#URLs').dataset.staticurl}${picture}`);
                            image.setAttribute("style","max-height: 20em; width: auto; max-width: 95%;");
                            msg.append(image);
                            msg.append(document.createElement('br'));
                        }

                        msg.append(document.createElement('br'));
                        document.querySelector("#messages").append(msg);
                    }

                };
                request.send(); 
            };

            // Code to be executed when user joins a channel for the first time
            if (document.querySelector("#send") != null) {
                
                // When channel is joined directly by entering its URL:
                if (document.querySelector('#temp').innerHTML === localStorage.getItem("currentPage"))
                    document.querySelector('#temp').innerHTML = "";
                else {
                    localStorage.setItem("currentPage", document.querySelector('#temp').innerHTML);
                    document.querySelector('#temp').innerHTML = "";
                }

                currentChannel = localStorage.getItem("currentPage");
                document.querySelector("h1").innerHTML = `${currentChannel} channel`;
                document.title = currentChannel;
                loadPage(currentChannel);

                charCounter = 0;

                // Remove uploaded file
                discard = () => {
                    $("#inpFile").val('');
                    document.querySelector("#filename").innerHTML = "";
                    document.querySelector("#discardSpan").innerHTML = "";
                    if (charCounter === 0)
                        document.querySelector('#send').disabled = true;                    
                };

                // Display name of file uploaded
                document.querySelector("#inpFile").onchange = () => {
                    filename = document.querySelector("#inpFile").files[0].name;
                    document.querySelector("#filename").innerHTML = filename;
                    document.querySelector("#discardSpan").innerHTML = "<button id='discard'>Discard</button>";

                    //Conditions for message submitting
                    if (charCounter > 0 || document.querySelector("#inpFile").value != "") {
                        document.querySelector('#send').disabled = false;
                    }
                    else
                        document.querySelector('#send').disabled = true;
                    
                    // Remove uploaded file
                    document.querySelector("#discard").onclick = () => {
                        discard();
                    };
                };

                // Display new message (everytime a JSON received from the server)
                socket.on('new message', data => {
                    if (data.channel === localStorage.getItem("currentPage")) {
                        var msgSender = data.sender;
                        var msgContent = data.content;
                        var timestamp = new Date(data.timestamp);
                        var picture = data.picture;

                        const header = document.createElement('div');
                        header.setAttribute("style","color:LightSlateGrey;");
                        const sender = document.createElement('b');
                        sender.innerHTML = `${msgSender}:`;
                        const time = document.createElement('i');
                        time.setAttribute("style",'font-size: 0.85em;');
                        time.innerHTML = `&nbsp; &nbsp; ${zeroFill(timestamp.getMonth()+1,2)}/${zeroFill(timestamp.getDate(),2)}/${timestamp.getFullYear()} at ${zeroFill(timestamp.getHours(),2)}:${zeroFill(timestamp.getMinutes(),2)}:${zeroFill(timestamp.getSeconds(),2)}`;
                        header.append(sender);
                        header.append(time);
                        var msg = document.createElement('div');
                        msg.append(header);
                        if (msgContent != "") {
                            msg.append(msgContent);
                            msg.append(document.createElement('br'));
                        }

                        if (picture != "") {
                            const image = document.createElement('img');
                            image.setAttribute("src",`${document.querySelector('#URLs').dataset.staticurl}${picture}`);
                            image.setAttribute("style","max-height: 20em; width: auto; max-width: 95%;");
                            msg.append(image);
                            msg.append(document.createElement('br'));
                        }

                        msg.append(document.createElement('br'));
                        document.querySelector("#messages").append(msg);
                        $(msg).hide().fadeIn(1000);
                    } 
                });

                // Conditions for message submitting
                document.querySelector("#send").disabled = true;
                document.querySelector("#newMsg").onkeyup = () => {

                    //Check that input is not only made of whitespaces
                    let charCounter = 0;
                    for (let i = 0; i < document.querySelector("#newMsg").value.length; i++) {
                        let channelName = document.querySelector("#newMsg").value;
                        if (channelName.charAt(i) != " ") {
                            charCounter++;
                        }
                    }

                    if (charCounter > 0 || document.querySelector("#inpFile").value != "") {
                        document.querySelector('#send').disabled = false;
                    }
                    else
                        document.querySelector('#send').disabled = true;
                };

                // When message is submitted, send JSON object to the server
                document.querySelector('#send').onclick = () => {
                    const time = new Date().getTime();
                    const newSender = localStorage.getItem('username');
                    const newMsg = document.querySelector("#newMsg").value;
                    var inpFile = document.querySelector('#inpFile');

                    const formData = new FormData();

                    let attachment = "n"

                    // Send picture if uploaded:
                    if (inpFile.value != "") {
                        formData.append("image", inpFile.files[0]);
                        attachment = "y";
                    }

                    var obj = {"channel":localStorage.getItem("currentPage"),"timestamp": time, "newSender": newSender,"newMsg": newMsg, "attachment": attachment};

                    var myData = JSON.stringify(obj);
                    var data = new File([myData], "data.txt", {type: "text/plain"});

                    formData.append("file",data);

                    fetch(`${window.origin}/upload`, {
                        method: "POST",
                        body: formData
                        })
                        .catch(function(error) {
                            console.log("Fetch error: " + error);
                    });

                    document.querySelector("#newMsg").value = "";
                    discard();
                    return false;
                };

            } 

        }

    }

    // Redirect to last channel visited when the website is accessed more than 1 second after it has been left
    var d = new Date;
    if (localStorage.getItem("currentPage") != null && localStorage.getItem("lastVisit") != null) {
        var offlineTime = d.getTime() - Number(localStorage.getItem("lastVisit")) - (Number(localStorage.getItem("chrono"))*1000);
        if (document.title != localStorage.getItem("currentPage") && offlineTime > 2000)
            redirect(localStorage.getItem("currentPage"));
    }

    // Set up a counter measuring how long does the user stays to know when the website is left (to reload the last visited channel later on)
    setInterval(record, 1000);
    var chrono = 0;
    function record() {
        chrono++;
        localStorage.setItem("chrono", chrono);
    }
    var now = new Date;
    localStorage.setItem("lastVisit", now.getTime());

});
