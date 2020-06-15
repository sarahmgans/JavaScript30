const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false})
  .then(stream => {
    console.log(stream);
    // turning video stream into something video player can understand
    video.srcObject = stream;
    video.play();
  })
  // in case someone doesn't let you access their webcam
  .catch(err => {
    console.error(`OH NO!`, err);
  });
}

// take frame from this video and paint it onto the canvas on the screen
function paintToCanvas(){
  const width = video.videoWidth;
  const height = video.videoHeight;
  // make canvas same size as video
  canvas.width = width;
  canvas.height = height;
  // every 16 miliseconds, put image from webcam and put it into canvas (return so that you can have access to it if you want to stop it)
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them
    pixels = rgbSplit(pixels)
    // ctx.globalAlpha = 0.1;
    // pixels = greenScreen(pixels);
    // pixels = redEffect(pixels)
    // put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

// take photo
function takePhoto() {
  // play the sound
  snap.currentTime = 0;
  snap.play();
  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  // create link
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML= `<img src="${data}" alt="Handsome Man"/>`;
  // where we're going to dump our links. like jQuery, .prepend();
  strip.insertBefore(link, strip.firstChild)
}

function redEffect(pixels) {
  for(let i = 0; i < pixels.data.length; i+=4){
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // red
    pixels.data[i + 1] = pixels.data[i + 1] - 50;  // green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5  // blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
     pixels.data[i - 150] = pixels.data[i + 0]; // red
     pixels.data[i + 500] = pixels.data[i + 1]; // green
     pixels.data[i - 550] = pixels.data[i + 2]; // blue
  }
  return pixels;
}

// green screen
function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out! fourth is alpha, transparency value
      pixels.data[i + 3] = 0;
    }
  }
  return pixels;
}

getVideo();

// listen for event on video element. when video plays it emits event called canplay, which will then call paintToCanvas
video.addEventListener('canplay', paintToCanvas)