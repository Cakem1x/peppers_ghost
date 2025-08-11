const ui = {
    button_start_stop: document.getElementById('button_start_stop'),
    canvas_segmented: document.getElementById('canvas_segmented_output'),
    canvas_segmented_context: document.getElementById('canvas_segmented_output').getContext('2d'),
    video_input: document.getElementById("video_input"),
    hue1: {
        center: document.getElementById('hue1_center'),
        range: document.getElementById('hue1_range'),
        output: document.getElementById("output_hue1"),
    },
};

let vid_capture_state = {
    streaming: false,
    stream: null,
    capture: null,
};

cv['onRuntimeInitialized'] = async () => {
    ui.button_start_stop.removeAttribute('disabled');
};

function on_video_started() {
    vid_capture_state.streaming = true;
    ui.button_start_stop.innerText = 'Stop';
    vid_capture_state.capture = new cv.VideoCapture(ui.video_input);
    segmentation_state.timer_id = setTimeout(process_video_hsv_segmentation, 0);
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
        if (segmentation_state.timer_id) {
            clearTimeout(segmentation_state.timer_id);
            segmentation_state.timer_id = null;
        }
    }
});

let segmentation_state = {
    timer_id: null,
    src: null,
    hsv: null,
    mask_hue1: null,
    mask_hue2: null,
    bgr: null,
};

const fps = 30;
function process_video_hsv_segmentation() {
    if (!segmentation_state.src){
        segmentation_state.src = new cv.Mat(ui.video_input.height, ui.video_input.width, cv.CV_8UC4);
    }
    if (!segmentation_state.hsv){
        segmentation_state.hsv = new cv.Mat(ui.video_input.height, ui.video_input.width, cv.CV_8UC4);
    }
    if (!segmentation_state.mask_hue1){
        segmentation_state.mask_hue1 = new cv.Mat(ui.video_input.height, ui.video_input.width, cv.CV_8UC1);
    }
    if (!segmentation_state.mask_hue2){
        segmentation_state.mask_hue2 = new cv.Mat(ui.video_input.height, ui.video_input.width, cv.CV_8UC1);
    }
    if (!segmentation_state.dst){
        segmentation_state.dst = new cv.Mat(ui.video_input.height, ui.video_input.width, cv.CV_8UC4);
    }

    // get input
    const begin = Date.now();
    vid_capture_state.capture.read(segmentation_state.src);
    cv.cvtColor(segmentation_state.src, segmentation_state.hsv, cv.COLOR_BGR2HSV);

    // process
    const min_hue = Math.max(parseFloat(ui.hue1.center.value) - parseFloat(ui.hue1.range.value), 0);
    const max_hue = Math.min(parseFloat(ui.hue1.center.value) + parseFloat(ui.hue1.range.value), 255);
    ui.hue1.output.textContent = `[${min_hue},${max_hue}]`;
    const low = new cv.Mat(segmentation_state.hsv.rows, segmentation_state.hsv.cols, segmentation_state.hsv.type(), [min_hue, 0, 0, 0]);
    const high = new cv.Mat(segmentation_state.hsv.rows, segmentation_state.hsv.cols, segmentation_state.hsv.type(), [max_hue, 255, 255, 255]);
    cv.inRange(segmentation_state.hsv, low, high, segmentation_state.mask_hue1);

    // write output
    cv.cvtColor(segmentation_state.mask_hue1, segmentation_state.dst, cv.COLOR_GRAY2BGR);
    cv.imshow("canvas_segmented_output", segmentation_state.dst);

    // schedule next function call
    const delay = 1000/fps - (Date.now() - begin);
    segmentation_state.timer_id = setTimeout(process_video_hsv_segmentation, delay);

    delete low;
    delete high;
}
