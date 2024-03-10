function initDownloadButton() {
    let download_control = document.getElementById("download_control");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(download_control);
    download_control.addEventListener("click", function () {
        document.getElementById("download_modal").showModal();
    });
    let download_button = document.getElementById("start_download");
    download_button.addEventListener("click", function () {
        const download_type = document.querySelector("#download_modal input:checked").value;

        // create query for which data to download based on user selection of download type
        let q;
        if (download_type === "All") {
            q = query(points_collection);
        }
        else if (download_type === "Nonarchived") {
            q = query(points_collection, where("archived", "==", false));
        }
        else if (download_type === "Archived") {
            q = query(points_collection, where("archived", "==", true));
        }

        // get data
        getDocs(q).then((query_snapshot) => {
            // convert query snapshot into list of JSON objects (don't need ID)
            const data = [];
            query_snapshot.forEach(doc => data.push(doc.data()));

            //sort by date, so easier to read the JSON file
            data.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

            // convert to JSON and download
            const data_string = JSON.stringify(data, null, 4); // use 4 spaces as whitespace indent
            const blob = new Blob([data_string], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            let d = new Date();
            const dateString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear();

            let a = document.createElement("a");
            a.href = url;
            a.download = "PMAPS Data Backup " + dateString + (download_type == "All" ? "" : " " + download_type);
            a.click(); // start download

            URL.revokeObjectURL(url); // saves memory, since the created URL stays around until page unload by default

            //we're done downloading, close the modal
            document.getElementById("download_modal").close();
        });
    });
}