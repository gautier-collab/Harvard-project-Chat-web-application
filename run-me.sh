#!/bin/bash

while read -r line; do
    echo "$line"
    if [[ "$line" == *"Debugger PIN"* ]]; then
        echo "" && echo "The web application is launched at http://127.0.0.1:5000/" && echo ""
        python3 app/website-opening.py
    fi
done< <(docker-compose run --rm --service-ports web)
