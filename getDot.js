function getDot(category) // Given the category of a data point, spits out the appropriate color of the data point
{
    if (category == "Waterfall") //purple
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAi0lEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NMov6vzp99f8zVWfAdKBh4H+g+EyYorQ027T//2f+x8CxFrEghbEgRQcOFB/Aqmhv4V6Qor0gRQ8ftj/Equh2822QottEmxQLshubohCjEJCiEJjj54N8tzFrI9h36zLWwXw3jQENgMJpIzSc1iGHEwBt95qDejjnKAAAAABJRU5ErkJggg==";
    else if (category == "Water") //blue
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC81M4v6n56++n9V1RkwbWgY+B8oPhOmKM3WNu3/zJn/MbCFRSxIYSxI0YHi4gNYFRUW7gUp2gtS9LC9/SFWRc3Nt0GKbhNtUizIbmyKjIxCQIpCYI6fD/JdVtZGsO8yMtbBfDeNAQ2AwmkjNJzWIYcTAMk+i9OhipcQAAAAAElFTkSuQmCC";
    else if (category == "Safety") //yellow
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAi0lEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NijL7v3p1+v8zZ6rAdGCg4X+g+EyYorS0NNv////PxMCxsRYghbEgRQcOHCjGqmjv3kKQor0gRQ8fPmzHquj27WaQottEmxQLshubopAQI5CiEJjj54N8t3FjFth369ZlwHw3jQENgMJpIzSc1iGHEwB8p5qDBbsHtAAAAABJRU5ErkJggg==";
    else if (category == "Campsite")  //green
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiElEQVR42mNgQIAoIF4NxGegdCCSHAMzEC81izL7n746/X/VmSowbRho+B8oPhOmKM02zfb/TCzQItYCpDAWpOhA8YFirIoK9xaCFO0FKXrY/rAdq6Lm280gRbeJNikWZDc2RUYhRiBFITDHzwf5LmtjFth3GesyYL6bxoAGQOG0ERpO65DDCQDX7ovT++K9KQAAAABJRU5ErkJggg==";
    else if (category == "Pro-Tip!") //red
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NUlH5v9rF5f+ZoCAwHaig8B8oPhOmKC1NU/P//7Q0DByrqgpSGAtSdOCAry9WRXt9fECK9oIUPXwYFYVV0e2ICJCi20SbFAuyG5uiECUlkKIQmOPng3y30d0d7Lt1bm4w301jQAOgcNoIDad1yOEEAFm9fSv/VqtJAAAAAElFTkSuQmCC";
    else if (category == "Landmark") //darkgreen+
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAArUlEQVR42mNggAIBJYZCUU2Go8KqDLdBtKAKQyYDEmAW1WI4aBvM9d86meW/bSormLYO4vwvpsOwA6yCT56h2jGE+79lGtN/41QGOAbx7YAa+RUZShiE1Riu2KSwQCTTkDCQDxIXVme4yCCozPDKDmgFNkUgcSFlhmfEmQSyE2Q3NjfZBHP+B/oyG+x4MW2GPWDfpUB9lwL33XbkYACHk4gGw0lQOIloMhxHDicA77heAmO53v0AAAAASUVORK5CYII=";
    else if (category == "Funny Story") //darkpurple+
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAq0lEQVR42mNggAIlBqVCTQbNo6oMqrdBtAqDSiYDEmDWYtA6mMQV/D+LJfl/LmsqmE7gDPqvw6CzA6xCnkG+Oo075H8WU9r/NIZUOAbxk4EaFRkUSxjUGNSu5LCkQCXTkHDq/2yguDqD+kUGZQblV3msqVgVgcSB8s+IMwlkJ8hubG5K4Az+D/RlNtjx2gzae0C+A+mE+C4F5rvtyMEADicNBo2T0HA6jhxOAIFkaCWva8LfAAAAAElFTkSuQmCC";
    else if (category == "Solos")//brown+
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAiklEQVR42mNgQIAoIF4NxGegdCCSHAMzEC+NslL5v7rU+f+Z3iAwHWii8B8oPhOmKC3NSfP//01pGDjWRhWkMBak6MCBVl+sivY2+4AU7QUpevhwThRWRbdnRIAU3SbapFiQ3dgUhZgpgRSFwBw/H+S7jVVuYN+tq3CD+W4aAxoAhdNGaDitQw4nAFZ+h+ARB/VOAAAAAElFTkSuQmCC";
    else if (category == "VAM (View Appreciation Moment)") //light blue
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAl0lEQVR42mNgQIAoIF4NxGegdCCSHAMzEC91sLH9H9c34X/hqjVg2tLM/D9QfCZMUZqni+v/+odP/2d/+QnHIL6TnT1IYSxI0YHM+YvAEmk//8ExiJ8xdwFI0V6Qooc1u/dhVVS5bSdI0W2iTYoF2Y3NTTYWliBFITDHzwf5LmnyVLDvEiZOhvluGgMaAIXTRmg4rUMOJwARmo9axahWIwAAAABJRU5ErkJggg==";
    else //darkgrey+
        //the "Other" category will map here along with any random category a user typed in (or undefined)
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAgElEQVR42mNggAJFRcUWdXX16yoqKs9AtJKSUh0DEmDW0NC44mhr+9/e3h6OHW1s/mtqap4Dq5CXl+91QlMAVwgUV1BQaGdQVVV9iE0BDKupqd1nUFZW/uCARxFQ/i1xJoHsdMTjJqAvG8COB/ruAg7fnUUOBlg43YSG0w3kcAIAxcVqHwlKq6YAAAAASUVORK5CYII=";
}