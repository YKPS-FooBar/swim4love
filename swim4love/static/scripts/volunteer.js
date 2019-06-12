/* A large portion of this code is copied from <https://github.com/serratus/quaggaJS/blob/master/example/live_w_locator.js> */
// to stop, use Quagga.stop()

// config, for Quagga.init(config, callback)
var config = {
    inputStream: {
        name: 'Live',
        type: 'LiveStream',
        // Constraints for the video camera, pretty self explanatory
        // Check <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Parameters>
        // for possible values
        constraints: {
            width: {min: 640},
            height: {min: 480},
            facingMode: 'environment',
            aspectRatio: {min: 1, max: 2}
        },
        target: document.querySelector('#scanner')
    },
    locator: {
        // Size of a barcode relative to screen
        // Reckon that medium is about right
        patchSize: 'medium',
        // Subsampling picture to half of resolution
        halfSample: true
    },
    // Number of workers
    numOfWorkers: 4,
    // Number of scans per second
    frequency: 10,
    decoder: {readers: ['code_128_reader']},
    // To locate the barcode on image
    locate: true
};

$(document).ready(() => {
    // init, see <https://github.com/serratus/quaggaJS#quaggainitconfig-callback>
    Quagga.init(config, error => {
        if (error) {
            console.log(error);
        } else {
            // TODO, actual init here
            // TODO, attach listeners
            // TODO, see if the camera is able to zoom or turn on torch: (check <https://serratus.github.io/quaggaJS/#tipsandtricks>)
            //   var track = Quagga.CameraAccess.getActiveTrack();
            //   if (typeof track.getCapabilities === 'function') {
            //       var capabilities = track.getCapabilities();
            //   } else {
            //       var capabilities = {};
            //   }
            // capabilities.torch would be true if torch is available
            // capabilities.zoom would require you to check the documentation
            // to zoom, track.applyConstraints({advanced: [{zoom: parseFloat(value)}]});
            // to torch, track.applyConstraints({advanced: [{torch: !!value}]});
            // TODO, allow user to choose video device from Quagga.enumerateVideoDevices().then(devices => {do something with device names; check documentation})
            //       (label for default device is Quagga.CameraAccess.getActiveStreamLabel())
            Quagga.start()
        }
    });


    // In the following 2 functions, 'result' looks like <https://github.com/serratus/quaggaJS#the-result-object>.
    // When the barcode is processed, draw a green box for possible barcodes / blue box for the definite barcode with a red segment
    Quagga.onProcessed(result => {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
        if (result) {
            if (result.boxes) {
                result.boxes.filter(box => {
                    return box !== result.box;
                }).forEach(box => {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: 'green', lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: 'blue', lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });


    // When detected, log
    Quagga.onDetected(result => {
        var code = result.codeResult.code;
        console.log("Detected barcode: ", result, code);
        $('#result').append(code);
        $.post('/swimmer/add-lap', {id: code});
    });
});
