# ride-tracker
Dashboard for your Lyft receipts

View the project at <a href="http://ridetracker.meteor.com">ridetracker.meteor.com</a>

Crawls GMail for Lyft receipt emails only. Parses the emails' text and html for ride details and aggregate the data. View pretty graphs of data, maps of routes via Google Static Maps, and other fun bits.

FE: angular-meteor

BE: meteor

## Motivation

Hackathon style challenge -- first version <48hrs.
First published meteor app :)

## To Do

-  Animations
-  Whatever else the people want

## Installation

1. Clone the project <code>git clone https://github.com/srtucker22/ride-tracker.git</code>
2. Go to the primary directory <code>cd ride-tracker</code>
3. Run meteor to get all the packages <code>meteor</code>
4. Add a settings.json to the primary directory <code>touch settings.json</code>
5. Add your personal settings for the following services included in meteor-cryptogram (or remove the ones you don't want)

        ```
        {
          "google" : {
            "client_id" : "YOUR_CLIENT_ID",
            "client_secret" : "YOUR_CLIENT_SECRET"
          },
          "facebook" : {
            "appId": "YOUR_APP_ID",
            "secret": "YOUR_APP_SECRET"
          },
          "kadira": { 
            "appId": "YOUR_APP_ID", 
            "appSecret": "YOUR_APP_SECRET" 
          },
          "papertrail" : {
            "port" : YOUR_PORT_NUMBER
          }
        }
        ```
6. run the app with the settings <code>meteor --settings settings.json</code>
7. enjoy!

## License

The MIT License

Copyright (c) 2015 Glipcode http://glipcode.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
