# -------- Harvard-project-Chat-web-application --------

Screencast presenting my web application (before it was containerized): https://www.youtube.com/watch?v=hrpNEo6BrBU

Slack-inspired web application that lets users create chatrooms, post messages and pictures and receive them in real-time.

My project is an online messaging service named Flack. Users can sign in to the website with a display name, create channels to communicate in, as well as see and join existing channels. Once a channel is selected, users are able to send and receive messages as well as images with one another in real time.

requirements.txt contains the name of the packages that must be installed before launching the website.
Application.py contains the Python backend code and the flask routes to redirect the users to the URLs.
The templates folder contains 5 HTML files that define the structure and elements of the web pages.
The static folder contains index.js which defines how the code operates on the client side. It's also the storage folder of all the pictures posted by the users.


docker-compose run --service-ports web