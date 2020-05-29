"""
Before running 'flask run', enter the following line in your Unix-like terminal:
export FLASK_APP=application.py
export DATABASE_URL='postgres://xdsltfznyrmffg:3ac7542170c59e36bbcf57e5619b90f57c8d538be0ce3f892fc45db0eb403ac0@ec2-174-129-253-125.compute-1.amazonaws.com:5432/d8b2l04n622ohs'
"""

import os, pathlib, ast, random, string, time
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.secret_key = 'super secret key'
socketio = SocketIO(app)

currentDir = pathlib.Path(__file__).parent.absolute()
app.config['UPLOAD_FOLDER'] = f"{currentDir}/static"

channels = {}
counter = 0


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/username")
def username():
    return render_template("username.html")

@app.route("/<string:channel>")
def channelPage(channel):
    if channel in channels:
        return render_template("channel.html", channel = channel)
    else:
        return render_template("index.html", error = "yes")

@app.route("/channels")
def listChannels():
    return jsonify(channels)

@app.route("/messages/<string:channel>")
def chat(channel):
    global channels
    return jsonify(channels[channel])

@socketio.on("create channel")
def create(newChannel):
    global channels
    # The following line decodes the data received (which is in an utf-8 format) so the special characters are rendered normally
    name = newChannel['name'].encode('iso-8859-1').decode('utf-8')
    channel = {}
    channels[name] = channel
    emit('new channel', {'name': name}, broadcast=True)

# Upload image
@app.route("/upload", methods=["POST"])
def create_entry():
    # check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
    file = request.files["file"]
    file.save(os.path.join(currentDir, "data.txt"))
    print(f"script is run in {pathlib.Path(__file__).parent.absolute()}")
    print(f"current working directory is {pathlib.Path().absolute()}")
    f = open("data.txt", 'r')
    predata = f.readlines()[0]
    f.close()
    os.remove("data.txt")
    data = ast.literal_eval(predata)
    channel = data["channel"]
    sender = data["newSender"]
    content = data["newMsg"]
    timestamp = data["timestamp"]
    attachment = data["attachment"]

    # Case of uploaded picture
    if attachment == "y":
        image = request.files['image']
        temp, extension = image.filename.split(".")
        filename = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

        # Check if the name of the file already exists
        def nameCheck(filename):
            for chan in channels:
                for msg in channels[chan]:
                    if filename != channels[chan][msg]:
                        continue
                    else:
                        return "change"
            return "OK"

        while nameCheck(filename) == "change":
            filename = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        picture = f"{filename}.{extension}"
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], picture))
    else: picture = ""

    # Without the following line, python would expect the variable to be defined locally (and then outputs that it is undefined)
    global counter

    message = {"sender": sender, "content": content, "timestamp": timestamp, "picture": picture}
    chat = channels[channel]
    chat[counter] = message
    counter += 1

    # Keep a maximum of 100 messages per channel in the server memory
    if len(chat)>100:
        for i in chat:
            os.remove(f"static/{chat[i]['picture']}")
            del chat[i]
            break
    message["channel"] = channel
    socketio.emit("new message", message, broadcast=True)

    return ""
