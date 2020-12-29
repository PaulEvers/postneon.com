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
        source.src = url;
        video.setAttribute("loop", "");
        video.id = src;
        video.volume = 0;
        video.setAttribute("playsinline", "true");
        enableInlineVideo(video);
        video.appendChild(source);
        document.querySelector("#videos").appendChild(video);
        // video.play();
        // await isReady(video);
        resolve(video);
        /* isReady(video).then(() => {
            
        }) */
        // video.pause();
        // video.addEventListener('loadedmetadata', () => {
        //     resolve(video);
        // })
    })

}
export default createVideo;