# -------- Harvard-project-Chat-web-application --------

Screencast presenting my web application (before it was containerized): https://youtu.be/ArwJCyf6YcE

This is a web application named Flack, similar in spirit to Slack, built as my Project 2 of the Harvard course CS50's Web Programming with Python and JavaScript (2018 version). It lets users pick a display name, create chatrooms, post messages and pictures and receive content from other users in real-time. When a user leaves the website and comes back, he is redirected to the last channel he visited.

An important part of the code is executed on the client-side using JavaScript ES6. The front-end sends data to the Flask server through fetch API requests and Ajax calls. The back-end immediately sends the processed data to all the appropriate users using websockets. Usernames, channel names and messages can include special characters and still be rendered correctly thanks to decoding and encoding methods.

To launch and access the web application, open the pulled repository in your UNIX terminal and run the following command (without sudo unless the terminal asks it):
# bash run-me.sh
