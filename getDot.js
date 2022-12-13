function getDot(category) // Given the category of a data point, spits out the appropriate color of the data point
{
    switch(category){
        case "Waterfall": return "dots/darkblue.png";
        case "Water": ""; return "dots/blue.png";
        case "Safety": return "dots/yellow.png";
        case "Campsite": return "dots/lightgreen.png";
        case "Pro-Tip!": return "dots/red.png";
        case "Landmark": return "dots/green.png";
        case "Funny Story": return "dots/pink.png";
        case "Solos": return "dots/orange.png";
        case "VAM (View Appreciation Moment)": return "dots/lightblue.png";
        default: return "dots/white.png";
    }
}