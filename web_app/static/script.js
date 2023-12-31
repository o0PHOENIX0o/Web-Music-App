const progress = document.getElementById("progress");
const progressTime = document.getElementById("progressTime");
const totalTime = document.getElementById("totalTime");
const song = document.getElementById("song");
const ctrlIcon = document.getElementById("ctrlIcon");
const backwardButton = document.getElementById('backward');
const forwardButton = document.getElementById('forward');
const volumeRanger = document.getElementById("volumeRange");
const resp = document.getElementById("response");

song.onloadedmetadata = function () {
    progress.max = song.duration;
    progress.value = song.currentTime;

    const duration = song.duration;
    const totalMinutes = Math.floor(duration / 60);
    const totalSeconds = Math.floor(duration % 60);

    totalTime.textContent = `${totalMinutes}:${totalSeconds < 10 ? "0" : ""}${totalSeconds}`;
}

var existingTextContent = [];
GetSongList();
// updateAudioAndImage(existingTextContent[0]);


function toggleDropdown() {
    GetSongList();
    var dropdown = document.getElementById("myDropdown");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}



function sendData() {

    // Get the value from the input field
    var data = document.getElementById("input_field").value;
    console.log(data)
    var msg = "preparing song " + data + " please wait";
    console.log(msg);
    resp.textContent = msg

    // Create a JSON object
    var jsonData = { "data": data };

    // Send the JSON data to the server
    fetch("/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(jsonData)
    })


        .then(response => response.json())
        .then(data => {
            resp.textContent = "ready to play";
            console.log(data);
            updateAudioAndImage(data);
        });
}

function download() {
    var song = document.getElementById("song_title").textContent;
    var downloadLink = document.createElement('a');
    downloadLink.href = `static/audios/${song}.mp4`; L
    downloadLink.download = song;
    downloadLink.click();
}

function GetSongList() {
    // Send the JSON data to the server
    fetch("/songlist", { method: "GET" })
        .then(response => response.json())
        .then(data => {
            var container = document.getElementById('myDropdown');

            for (const key in data) {
                var files = JSON.stringify(data[key]).replace(/"/g, '');

                if (!existingTextContent.includes(files)) {
                    var newElement = document.createElement('a');
                    newElement.textContent = files;
                    container.appendChild(newElement);
                    existingTextContent.push(files);
                }
            }

            var options = document.querySelectorAll('.dropdown-content a');

            options.forEach(function (option) {
                option.addEventListener('click', function () {
                    resp.textContent = "ready to play";
                    updateAudioAndImage(option.textContent);
                    console.log(option.textContent);
                });
            });

        });
}

function updateAudioAndImage(data) {

    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");

    var audioElement = document.getElementById("song");
    var imageElement = document.getElementById("thumbnail").getElementsByTagName("img")[0];


    audioElement.src = `static/audios/${data}.mp4`;
    audioElement.load();

    imageElement.src = `static/img/${data}.jpg`;

    document.getElementById("song_title").textContent = data;
}

function playPause() {
    resp.textContent = "";
    if (ctrlIcon.classList.contains("fa-pause")) {
        song.pause();
        ctrlIcon.classList.remove("fa-pause");
        ctrlIcon.classList.add("fa-play");
    } else {
        song.play();
        ctrlIcon.classList.add("fa-pause");
        ctrlIcon.classList.remove("fa-play");
    }
}

setInterval(() => {
    progress.value = song.currentTime;
    const CurrentTime = song.currentTime;
    const totalMinutes = Math.floor(CurrentTime / 60);
    const totalSeconds = Math.floor(CurrentTime % 60);
    progressTime.textContent = `${totalMinutes}:${totalSeconds < 10 ? "0" : ""}${totalSeconds}`;

}, 500);

progress.oninput = function () {
    song.currentTime = progress.value;
    ctrlIcon.classList.add("fa-pause");
    ctrlIcon.classList.remove("fa-play");
    song.play();
};



function volume() {
    const volumeSlider = document.getElementById("volumeSlider");
    if (volumeSlider.style.display === "none") {
        volumeSlider.style.display = "block";
    } else {
        volumeSlider.style.display = "none";
    }
}

volumeRanger.addEventListener("input", function () {
    const sliderValue = volumeRanger.value;
    console.log("Slider Value: " + sliderValue);

    if (song) {
        song.volume = sliderValue / 100;
    }
});


function backward() {
    console.log("back");
    var currentSong = document.getElementById("song_title").textContent;
    console.log(currentSong);
    var s = existingTextContent.indexOf(currentSong) - 1;
    if (s < 0) {
        s = existingTextContent.length - 1;
    }
    console.log(s);
    updateAudioAndImage(existingTextContent[s]);
}

function forward() {
    console.log("forward");
    var currentSong = document.getElementById("song_title").textContent;
    console.log(currentSong);
    var s = existingTextContent.indexOf(currentSong) + 1;

    if (s >= existingTextContent.length) {
        s = 0;
    }

    console.log(s);
    updateAudioAndImage(existingTextContent[s]);

}
