function initDownloadButton(){
    let download_control = document.getElementById("download_control");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(download_control);
    download_control.addEventListener("click", function(){
        document.getElementById("download_modal").showModal();
    });
    let download_button = document.getElementById("start_download");
    download_button.addEventListener("click", function(){
        // we use the get function to get a fresh and correct copy of the data from the database, in case we messed up tracking data in the markers object upon onChildChanged etc.
        get(ref(database, "points")).then((snapshot) => {
            const all_data = snapshot.val();
            
            //figure out what points to download
            const download_type = document.querySelector("#download_modal input:checked").value;
            let data = {};
            if(download_type == "All"){
                data = all_data;
            }
            else {
                for(let key in all_data){
                    if(download_type == "Nonarchived" && !all_data[key].archived ||
                        download_type == "Archived" && all_data[key].archived)
                    {
                        data[key] = all_data[key];
                    }
                }
            }

            //nest inside "points", for consistency with the database (can't read root because of security rules stuff, see the README - database permissions)
            data = {points: data};

            //convert to JSON and download
            const data_string = JSON.stringify(data, null, 4); // use 4 spaces as whitespace indent
            const blob = new Blob([data_string], {type: "application/json"});
            const url = URL.createObjectURL(blob);

            let d = new Date();
            const dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear();

            let a = document.createElement("a");
            a.href = url;
            a.download = "PMAPS Data Backup " + dateString + (download_type == "All" ? "" : " " + download_type);

            a.click();

            URL.revokeObjectURL(url); // saves memory, since the created URL stays around until page unload by default

            //we're done downloading, close the modal
            document.getElementById("download_modal").close();
        });
    });
}