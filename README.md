## Table of Contents
1. [Overview](#overview)
2. [How the Code Works](#how-the-code-works)
3. [Making Edits](#making-edits)
4. [The Database](#the-database)
5. [The Google Maps API](#the-google-maps-api)

# Overview

## Introduction

PMAPS is an online tool used to record information about locations in Pisgah National Forest. This allows knowledge to be passed down and shared among generations of pwilders, preserving our collective knowledge even as people graduate.

To use, navigate to https://projectwildmaps.github.io/ and follow the instructions.

What it lets you do / how to use

Firebase

GitHub pages, with link to documentation (https://pages.github.com/)

Login info

## Description of Files

index.html
* The main HTML file. This contains the HTML and the core javascript used to make the app work.
See the index.html section below for more information on how this file is organized.

style.css
* stuff

map_definitions.js
* Stuff

init.js
* stuff

legend.js
* stuff

getDot.js
* stuff

dataInfoWindow.js
* stuff

inputInfoWindow.js
* stuff

autopan.js
* stuff

detect_mobile.js
* stuff

trails.js
* stuff

PMAPS Data Backup \[date\].json
* Contains the most recent backup made of the database. A new backup can be made by clicking the "Download Data" button while viewing PMAPS.

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

**Note that none of these files work, they are only here because I didn't want to delete them.**

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


# How the Code Works

## \<head\> Tag

## \<body\> HTML

## \<body\> Scripts

Include description of global vars (and use of the categories variable)
- how to add new categories

Include description of the script module, and explanation of why this is necessary (firebase). Also its limitations in terms of global scoping, and the use of window.varname if needed. Functions not needing to access the database should not be in here because of dealing with the scoping thing.

Also explain that the module code has to be in the HTML file for local testing to work, because of CORS security stuff if not running on a server.

Description of the init() and saveData() functions

Description of which maps are used / not

How data is displayed (markers object, marker layer etc), how the legend works, how archived points are handled (added / removed from the markerLayer)
- Note that the legend uses override/revert style so that it works with and plays nice with showing/hiding archived points. For controlling visibility, only one thing should be using override/revert style, and only one thing should be adding/removing points. Two ways of doing the same thing that don't interfere with each other.
- Ok actually we should be doing styling by setting properties only used for styling, and only showing the point if both properties are true



# Making Edits

Here are some common things you may want to change, and how to change them.

### Add a new category


### Remove an existing category
- mention that this will change existing points of the removed category to be considered as Other, so may want to go into the database and update those

### Add a new map


### Change the default starting location / add a new location
In index.html, the first script tag contains a list of locations as a global config variable. To change the default starting location, change which of these has the default property set to true. To add a new location, follow the format of the existing locations (there is a comment explaining what each of the properties means).


# The Database

The data is stored in a Google cloud database system called Firebase. We are using the free version (Spark plan) of the Firebase Realtime Database product. Using an external cloud database means that PMAPS can just be a static website instead of a server, which is much easier to deal with and host.

Overview of firebase

Link to firebase console

## Syntax to Read/Write to the Database

## Backing Up the Database

## Permissions (Database Rules)

## Free Version Limits

## App Check

https://www.google.com/recaptcha/admin/site/590705982

https://firebase.google.com/docs/app-check/web/recaptcha-provider?authuser=0&hl=en

Disabled, but if you want to enable it:
- click enforce in the firebase console
- uncomment the code under initialize firebase in index.html
- the app will now only work when served from projectwildmaps.github.io

## Useful Documentation Links


# The Google Maps API

Data layers, markers (Data.Feature objects), common functions (like setProperty, getProperty), setStyle, overrideStyle

Mention the autopan thing again maybe