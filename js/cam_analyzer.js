const ui = {
    button_start_stop: document.getElementById('button_start_stop'),
    canvas_segmented: document.getElementById('canvas_segmented_output'),
    canvas_segmented_context: document.getElementById('canvas_segmented_output').getContext('2d'),
    video_input: document.getElementById("video_input"),
    hue1_min: document.getElementById('hue1_min'),
    hue1_max: document.getElementById('hue1_max'),
};

let vid_capture_state = {
    streaming: false,
};

cv['onRuntimeInitialized'] = async () => {
    ui.button_start_stop.removeAttribute('disabled');
};

function on_video_started() {
    vid_capture_state.streaming = true;
    ui.button_start_stop.innerText = 'Stop';
    segmentation_state.timer = setTimeout(process_video_hsv_segmentation, 0);
}

ui.button_start_stop.addEventListener('click', () => {
    if (!vid_capture_state.streaming) {
        // setup video stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function(stream) {
                ui.video_input.srcObject = stream;
                ui.video_input.play();
                vid_capture_state.stream = stream;
                ui.video_input.addEventListener('canplay', on_video_started, false);
            })
            .catch(function(err) {
                console.error('Camera Error: ' + err.name + ' ' + err.message);
            });
    } else {
        ui.video_input.pause();
        ui.video_input.srcObject = null;
        ui.video_input.removeEventListener('canplay', on_video_started);
        if (vid_capture_state.stream) {
            vid_capture_state.stream.getVideoTracks()[0].stop();
        }
        vid_capture_state.streaming = false;
        ui.canvas_segmented_context.clearRect(0, 0, ui.canvas_segmented.width, ui.canvas_segmented.height);
        ui.button_start_stop.innerText = 'Start';
        segmentation_state.timer = null;
    }
});

let segmentation_state = {
    timer: null,
    fps: 30,
};

function process_video_hsv_segmentation() {
    const begin = Date.now();
    ui.canvas_segmented_context.drawImage(ui.video, 0, 0, ui.canvas_segmented.width, ui.canvas_segmented.height);
    src.data.set(ui.canvas_segmented_context.getImageData(0, 0, ui.canvas_segmented.width, ui.canvas_segmented.height).data);
    dst = cv.Mat();
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.imshow("canvas_segmented_output", dst);

    // schedule next function call
    const delay = 1000/fps - (Date.now() - begin);
    segmentation_state.timer = setTimeout(process_video_hsv_segmentation, delay);
}
