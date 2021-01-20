import enableInlineVideo from 'iphone-inline-video';

const isReady = (video) => {
    let canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    let ctx = canvas.getContext("2d");

    return new Promise((resolve) => {
        const pingVideo = (video) => {
            ctx.drawImage(video, 0, 0, 1, 1);
            var p = ctx.getImageData(0, 0, 1, 1).data;
            if (p.reduce((a, b) => a + b) > 0.5)
                resolve();
            else
                requestAnimationFrame(() => { pingVideo(video) });
        }
        pingVideo(video);
    })
}



const createVideo = ({ url, src }) => {
    return new Promise(async (resolve) => {
        var video = document.createElement("video");
        var source = document.createElement("source");
        source.src = `${url}`;
        video.setAttribute("loop", "");
        video.id = src;
        video.volume = 0;
        video.setAttribute("playsinline", "true");
        enableInlineVideo(video);
        video.appendChild(source);
        resolve(video);

        /*         var video = document.createElement("video");
                video.setAttribute("loop", "");
        
                var xhr = new XMLHttpRequest();
                xhr.open("GET", `${url}.mp4`, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = function (oEvent) {
        
                    var blob = new Blob([oEvent.target.response], { type: "video/mp4" });
                    console.log("LOADED!!!!!!!!!! ", `${src}.mp4`);
                    video.src = URL.createObjectURL(blob);
                    resolve(video);
                    //video.play()  if you want it to play on load
                }; 

        xhr.onprogress = function (oEvent) {

            if (oEvent.lengthComputable) {
                var percentComplete = oEvent.loaded / oEvent.total;
                // do something with this
            }
        }

        xhr.send();*/
    })

}
export default createVideo;