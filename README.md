## Table of Contents
1. [Overview](#overview)
2. [Making Edits](#making-edits)
3. [How the Code Works](#how-the-code-works)
4. [The Database](#the-database)
5. [The Google Maps API](#the-google-maps-api)

# Overview

## Introduction

PMAPS is an online tool used to record information about locations in Pisgah National Forest. This allows knowledge to be passed down and shared among generations of pwilders, preserving our collective knowledge even as people graduate.

To use, navigate to https://projectwildmaps.github.io/ and follow the instructions.

The app lets users mark points, along with descriptions of those points. These annotations are publicly visible to anyone visiting the site. There is also the ability to filter by point category and date, and to switch the basemap or location easily. The app is designed to work on both computers and phones.

The data is stored in a Google Firebase Realtime Database. The security rules are set up such that new data can be added, but existing data cannot be overridden. See more details in the [database section](#the-database) of the docs.

The site is hosted using GitHub pages. Documentation for that is here: https://pages.github.com/. It is pretty straightforward - code updates pushed to the main branch of this repository are automatically deployed. Note though that this means **the app MUST be static** - there is no backend code, only the HTML file and resources it links to. We're basically using Firebase as our "backend."

To modify the code or the database, you will need to obtain the login information for the projectwildmaps gmail and/or GitHub. There should be a folder in the PD Google Drive with this. For quick changes like adding a new category, see the [Making Edits](#making-edits) section. For larger changes, I recommend reading all of these docs so you fully understand how PMAPS works. **NOTE: If you make edits, make sure to comment your code AND document your changes in this README. For sustainability, it is important that PMAPS is easy to understand and maintain for someone who's never touched the code before.**

**Contact:** This project was most recently maintained by Adam Kosinski, class of 2024. You can find his contact information in the google doc with the login information.

## Description of Files

This is a brief description of the file structure to get you oriented. For more detail on how everything works together, please read the [How the Code Works](#how-the-code-works) section.

index.html
* The main HTML file. This also contains the JavaScript for setting up database access (see [here](#javascript-in-the-html) for why).

PMAPS Data Backup \[date\].json
* Contains the most recent backup made of the database. A new backup can be made by clicking the "Download Data" button while viewing PMAPS, and selecting "All Data." If for some reason that isn't working, you can log into the Firebase console and export the data as a JSON file from there.

TODO.txt
* This is an informal running list of TODO items.

none.png
* An empty image, returned when the program requests map tile images we don't have (see map_definitions.js for the code that manages this).

favicon.ico
* The image that appears on the browser tab next to the page's title.

### Old, Unused Files

**Note that none of these files work, they are only here because I didn't want to delete them.**

OLD_PMAPS.html
* The original version of PMAPS, which read data from a google spreadsheet and wrote new data by submitting to a google form through JavaScript. The spreadsheet is deleted, so this version doesn't work anymore. To run this version, you just need this file, markerForm.html, and the map folders.

markerForm.html
* The HTML form that was embedded in the big red marker's info window, in the original version of PMAPS. Also contains JavaScript wizardry for sending stuff to a google form. Used with OLD_PMAPS.html only.

OLD_PMAPS_v6.html
* A newer version of PMAPS, that used a Firebase database to store data (as we are doing now). That database got deleted (and Firebase updated to use JavaScript modules), so this version doesn't work anymore. To run this, you only need this file and the map folders.

OLD_markerDataJSON.json
* The JSON data that was salvaged from the previous version of PMAPS. This data goes up through 2016. In the current version, the JSON format was tweaked slightly (mostly to do with how dates are stored), and some of these data points were cleaned up. So just ignore this and use the current JSON backup.

## Directories

css/
* This contains all the CSS files. We use multiple CSS files for easier code maintenance / organization.

js/
* This contains all the JavaScript files. We use multiple JavaScript files for easier code maintenance / organization.

natGeo/, usgsTiff/
* These contain the image tiles used for some of the maps. I believe many of these were generated with MapTiler? The images are organized by map_folder/zoom_level/x_coord/y_coord.png (or .jpg). See map_definitions.js for the code that references these files.

trails/
* Contains the trail vector data. This is unused as of 1/13/2023.

# Making Edits

Here are some common things you may want to change, and how to change them. It is still recommended to read  [How the Code Works](#how-the-code-works), but this section should be enough for making simple changes.

### Notes for Editing

Comments and Documentation!!! - though maybe less important for small changes
Making yourself a collaborator on github (or adding an SSH key to the projectwildmaps GitHub to authenticate your computer), cloning, pushing, automatic deployment via GitHub pages, etc.
Appcheck and localhost
Mobile responsiveness blah blah, here's how to test it with Chrome


### Add a new category


### Remove an existing category
- mention that this will change existing points of the removed category to be considered as Other, so may want to go into the database and update those

### Add a new map


### Change the default starting location / add a new location
In js/globals_and_config.js, there is a list of locations. To change the default starting location, change which of these has the default property set to true. To add a new location, follow the format of the existing locations (there is a comment explaining what each of the properties means).

### Edit the instructions


# How the Code Works

## index.html

This is the central file for PMAPS, which contains the HTML and includes all the libraries, CSS, and JavaScript needed to make PMAPS work. It is important that it is named "index.html" since GitHub pages searches for a file with this name as the entry point.

### CSS / JavaScript Inclusion
The head tag loads the CSS and the Google JavaScript libraries that we use. JavaScript files that are written by us are loaded at the end of the body tag. It is important that the Google libraries are fully loaded before our JavaScript files are, since our files make immediate use of the Google libraries.

#### JavaScript in the HTML
We tried to keep JavaScript out of the HTML file if possible, for easier code maintenance. The JavaScript for setting up the database access is in the HTML though because it has to be in a JavaScript module (how Firebase is set up), and it turns out that this can cause CORS problems when developing locally if the code is not physically in the HTML file. We could get around this by using a NodeJS server... but just plonking it in the HTML file is much easier. Another important thing to note about a JavaScript module is that it has its own scope - i.e. "global" variables in a module aren't actually global. To get around this in PMAPS, we explicitly expose certain database functions to the global scope by setting them as properties of the window object.

Read more about modules here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules, especially the section titled "Other differences between modules and standard scripts."

### HTML Organization
The body tag has four main sections, listed below in order:
1. The map div. This is just one empty div that Google puts a bunch of fanciness in later to create the map.
2. Hidden HTML. This is a hidden div containing HTML that will be used, but shouldn't be displayed at first. See below for more details.
3. Dialogs. This is where dialogs aka modals live. Currently there is the download data dialog and the welcome screen / instructions dialog.
4. JavaScript. We pull in all the custom JavaScript at the bottom of the body.

#### A note on the hidden HTML:
The hidden HTML consists of three main things: custom map controls, the new point form (the content of the input info window), and HTML templates used in the data info window to display point data.

The custom map controls are moved from the hidden section into the google-defined areas on the map when the program initializes. Here's an example of the code doing this for the legend (in legend.js):
```
var legend = document.getElementById('legend');
map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
```
Similarly, the new point form is moved into the input info window upon initialization by this line of code in newPoint.js:
```
inputInfoWindow.setContent(document.getElementById("inputInfoWindow_content"));
```
The HTML templates stay hidden, but copies are made of them for the data info window (displays point data) main content and comments. Since the HTML for these is dynamically generated based on the database data, it is useful to have templates, which we can copy and then insert the appropriate text into. We do it this way instead of using innerHTML to prevent an XSS vulnerability. Note: not using a fancier templating system because a) no backend because hosting on GitHub pages, and b) I tried using React.js and it was much messier since setting up a JSX compiling environment seemed overly complicated for an app that's supposed to have a low barrier for maintenance, and without that the readability was awful.

## CSS

All the CSS is in the css/ directory. The files are named intuitively:
* main.css for general stuff
* info_window.css for info window stuff
* dialog.css for the instructions screen and the download data dialog
* map_controls.css for custom map controls (like the legend, info icon, etc.)
    * By the way, the location dropdown is actually a custom control, I just copied the styling from Google's map selection dropdown so it would look consistent.

Custom fonts (only really used in the welcome/instructions dialog) are included in the head tag via Google's web font API. More on that if you're curious:
* https://fonts.google.com/
* https://developers.google.com/fonts/docs/getting_started

## JavaScript

Here we discuss each JavaScript file and what it does, in the order it appears in the HTML.

**globals_and_config.js**

(describe javascript files' functions and functionality one by one)

Include description of global vars (and use of the categories variable)

Description of which maps are used / not

How data is displayed (markers object, marker layer etc), how the legend works, how archived points are handled (added / removed from the markerLayer)


# The Database

The data is stored in a Google cloud database system called Firebase. We are using the free version (Spark plan) of the Firebase Realtime Database product. Using an external cloud database means that PMAPS can just be a static website instead of a server, which is much easier to deal with and host.

Overview of firebase

Link to firebase console

JSON data format
- include date string format, etc.

## Syntax to Read/Write to the Database

## Backing Up the Database

## Permissions (Database Rules)

Mention the thing where it complains if you allow reading root, so we just nest the whole database in a field called "points" and allow read to that.

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