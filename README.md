# -------- Harvard-project-Chat-web-application --------

Screencast presenting my web application (before it was containerized): https://www.youtube.com/watch?v=hrpNEo6BrBU

Slack-inspired web application named Flack, that lets users pick a display name, create chatrooms, post messages and pictures and receive them in real-time. When a user leaves the website and comes back, he is redirected to the last channel he has visited.

An important part of the code is executed on the client-side using JavaScript. The front-end sends data to the Flask server through Ajax calls and requests from the fetch API. The back-end immediately sends the processed data to all the appropriate users using websockets. Usernames, channel names or messages can include special characters and still be be rendered correctly, thanks to methods that decode and encode the fetched text.

To launch and access the web application, open the pulled repository in your UNIX terminal and run the following command (without sudo unless the terminal asks it):
# bash run-me.sh