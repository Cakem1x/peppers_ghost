let video = document.getElementById('video');
let canvas = document.getElementById('canvasOutput');
let ctx = canvas.getContext('2d');

cv['onRuntimeInitialized'] = async () => {
  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    let cap = new cv.VideoCapture(video);
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let gray = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let edges = new cv.Mat(video.height, video.width, cv.CV_8UC1);

    function processVideo() {
      cap.read(src);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.Canny(gray, edges, 50, 150);
      cv.imshow('canvasOutput', edges);
      requestAnimationFrame(processVideo);
    }

    requestAnimationFrame(processVideo);
  } catch (err) {
    console.error("Error accessing camera:", err);
    alert("Could not access camera: " + err.message);
  }
};
