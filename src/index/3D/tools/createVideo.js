import enableInlineVideo from 'iphone-inline-video';
export default async function ({ url, src }) {
    return new Promise((resolve) => {
        var video = document.createElement("video");
        var source = document.createElement("source");
        source.src = url;
        video.setAttribute("loop", "");
        video.id = src;
        video.volume = 0;
        video.setAttribute("playsinline", "true");
        enableInlineVideo(video);
        video.appendChild(source);
        document.querySelector("#videos").appendChild(video);
        video.addEventListener('loadedmetadata', () => {
            resolve(video);
        })
    })

}