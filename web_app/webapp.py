from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_audio
from flask import Flask, render_template, request, jsonify
import googleapiclient.discovery
from pytube import YouTube
import subprocess
import requests
import os

key = "AIzaSyB_o9r7DqsbC6kdXr0BPJrss7J2Fi4Y5pA"
youtube = googleapiclient.discovery.build("youtube", "v3", developerKey=key)

app = Flask(__name__)
static_path = "web_app/static/"


def SongList(static_path):
    file_list = os.listdir(f"{static_path}audios")

    myDict = {}

    for i in range(1, len(file_list) + 1):
        myDict[i] = file_list[i - 1].replace(".mp4", "").replace('"', "")

    return myDict


def sort_dir(directory_path):
    entries = os.scandir(directory_path)
    sorted_entries = sorted(
        entries, key=lambda entry: entry.stat().st_ctime, reverse=False)
    file_list = [entry.name for entry in sorted_entries]
    return file_list


def Clear_Space():
    audio_path = f"{static_path}audios"
    image_path = f"{static_path}img"

    audio_list = sort_dir(audio_path)
    img_list = sort_dir(image_path)
    print(audio_list)
    files_processed = 0
    for audio_name in audio_list:
        print("removing...")
        audio_ = os.path.join(audio_path, audio_name)
        img_ = os.path.join(image_path, audio_name.replace(".mp4", ".jpg"))

        if "sparkle" in audio_name:
            print("name was sparkle")
            continue

        print("removnig", audio_name)
        os.remove(audio_)
        os.remove(img_)
        files_processed += 1


def GetSong(name, path):

    def search(query):
        try:
            result = youtube.search().list(
                q=query,
                type="video",
                part="id",
                maxResults=1,
                # order="viewCount"
            ).execute()

            vId = result["items"][0]["id"]["videoId"]
            url = f"https://www.youtube.com/watch?v={vId}"

            return url

        except Exception as e:
            print("error", e)
            return None

    def download_thumbnail(link, img_file):
        yt = YouTube(link)
        thumbnail_url = yt.thumbnail_url
        response = requests.get(thumbnail_url)

        if response.status_code == 200:
            with open(img_file, 'wb') as file:
                file.write(response.content)
        else:
            print(
                f"Failed to download the thumbnail. Status code: {response.status_code}")
            return

        print(f"Thumbnail downloaded")

    def Clean_title(name):
        invalids = ["|", "►", "/", "#", "video",
                    "audios", "audio", "lyrical", "lyrics", "lyric", "   ", "  "]
        for i in invalids:
            name = name.replace(i, " ")
        return name

    def download(link, path):
        yt = YouTube(link)
        name = Clean_title((yt.title).lower())
        if not os.path.exists("{path}{name}.mp4"):
            stream = yt.streams.filter(only_audio=True).first()
            stream.download(
                output_path=f"{path}/audios/", filename=f"{name}.mp4")

        print("downloaded")
        return name

    if len(sort_dir(f"{path}audios")) > 10:
        print("cleaning")
        Clear_Space()

    link = search(name)

    name = download(link, path)

    img_file = f"{path}img/{name}.jpg"
    if not os.path.exists(img_file):
        download_thumbnail(link, img_file)
    return name


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    name = (data['data']).lower()
    print(name)

    if not len(name) == 0:
        new_name = GetSong(name, static_path)
        print(new_name)

    return jsonify(new_name)


@app.route('/songlist', methods=['GET'])
def songlist():

    songfiles = SongList(static_path)

    return jsonify(songfiles)


if __name__ == '__main__':
    app.run(debug=True)
