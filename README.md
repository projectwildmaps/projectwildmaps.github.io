# Overview

## Introduction

PMAPS is an online tool used to record information about locations in Pisgah. This allows knowledge to be passed down and shared among generations of pwilders, preserving our collective knowledge even
as people graduate.

To use, navigate to [https://projectwildmaps.github.io/](https://projectwildmaps.github.io/) and follow the instructions.

What it lets you do / how to use

Firebase

GitHub pages

Login info

## Description of Files

index.html
* The main HTML file. This contains the HTML and most of the javascript used to make the app work.
See the index.html section below for more information on how this file is organized.

style.css
* stuff

map_definitions.js
* Stuff

legend.js
* stuff

getDot.js
* stuff

autopan.js
* stuff

detect_mobile.js
* stuff

trails.js
* stuff

markerDataBackup_\[date\].json
* Contains the most recent backup made of the database. A new backup can be made by viewing the database from the Firebase console and exporting the data as JSON. When you do this, rename the file with the date the backup was made.

TODO.txt
* stuff

none.png
* An empty image, returned when the map requests map tile images we don't have (see map_definitions.js).

favicon.ico
* The image that appears on the browser tab next to the page's title.

### Node JS Stuff
These files are here to allow the app to be run from a server, instead of just as a static webpage.
This is mostly used for testing (e.g. connecting an iPhone to your computer's localhost to test mobile compatibility).

server.js
* Running `node server.js` will run the app from a server.

package.json, package-lock.json
* These store dependency information, as well as random other node js info that doesn't matter.

### Old, Unused Files

OLD_PMAPS.html
* The original version of PMAPS, which read data from a google spreadsheet and wrote new data by submitting to a google form through javascript. The spreadsheet is deleted, so this version doesn't work anymore. To run this version, you just need this file, markerForm.html, and the map folders.

markerForm.html
* The HTML form that was embedded in the big red marker's info window, in the original version of PMAPS. Also contains javascript wizardry for sending stuff to a google form. Used with OLD_PMAPS.html only.

OLD_PMAPS_v6.html
* A newer version of PMAPS, that used a Firebase database to store data (as we are doing now). That database got deleted (and Firebase updated to use javascript modules), so this version doesn't work anymore. To run this, you only need this file and the map folders.

## Directories

natGeo/, usgsTiff/, u1s11g1s/, usgsStolen/
* These contain the images used for the maps. I believe many of these were generated with MapTiler, in case you want to regenerate them. The images are organized by map_folder/zoom_level/x_coord/y_coord.png (or .jpg).

trails/
* Contains the trail vector data.



# Description of index.html

## \<head\> Tag

## \<body\> HTML

## \<body\> Scripts

Include description of global vars (and use of the categories variable)

Include description of the script module, and explanation of why this is necessary (firebase). Also its limitations in terms of global scoping, and the use of window.varname if needed. Functions not needing to access the database should not be in here because of dealing with the scoping thing.

Description of the init() and saveData() functions




# The Database

The data is stored in a Google cloud database system called Firebase. We are using the free version (Spark plan) of the Firebase Realtime Database product. Using an external cloud database means that PMAPS can just be a static website instead of a server, which is much easier to deal with and host.

Overview of firebase

Link to firebase console

## Syntax to Read/Write to the Database

## Backing Up the Database

## Permissions (Database Rules)

## Free Version Limits

## Useful Documentation Links


# GitHub Pages (Hosting)


# The Google Maps API
