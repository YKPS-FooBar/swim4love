/* A large portion of this code is copied from <https://github.com/serratus/quaggaJS/blob/master/example/live_w_locator.js> */

var isCameraOn = false;

// We will use the Cookie 'swimmers' to store a json-styled list of swimmers

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
        // <div> to show video & canvas
        target: document.querySelector('#barcode-scanner')
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
    frequency: 5,
    decoder: {readers: ['code_128_reader']},
    // To locate the barcode on image
    locate: true
};

function startCamera() {
    isCameraOn = true;
    $('#barcode-scanner').show();
    // init, see <https://github.com/serratus/quaggaJS#quaggainitconfig-callback>
    Quagga.init(config, error => {
        if (error) {
            console.log(error);
        } else {
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

    // Quagga.onProcessed(result => {
    //     process(result);
    // });

    // 'result' looks like <https://github.com/serratus/quaggaJS#the-result-object>.
    // When detected, stop camera and log
    Quagga.onDetected(result => {
        if (!isCameraOn) {
            console.log(`Detected swimmer #${id}, but the camera has already detected something else`)
            return;
        }
        isCameraOn = false;
        var id = result.codeResult.code;
        if (isValidId(id)) {
            Quagga.stop();
            $('#barcode-scanner').hide();
            addSwimmer(id);
        } else {
            isCameraOn = true;
        }
    });
}

function addSwimmer(id) {
    if (!isValidId(id)) {
        // TODO, visual error message
        alert(id + '格式不正确');
        return;
    }
    console.log(`Added swimmer #${id}`);
    // TODO, add swimmer to cookies
    Cookies.get('swimmers');
    $('#swimmers-list').prepend(`<li>Swimmer #${id}</li>`);

    updateSwimmersFromCookies();
    hideAddSwimmerDiv();
}

function isValidId(swimmerId) {
    return /^[0-9][0-9][0-9]$/.test(swimmerId);
}

function showAddSwimmerDiv() {
    $('#add-swimmer').show();
    $('#swimmers').hide();
    $('#add-swimmer-input').focus();
}

function hideAddSwimmerDiv() {
    $('#add-swimmer').hide();
    $('#swimmers').show();
    $('#add-swimmer-input').val('');
}

function updateSwimmersFromCookies() {
    // TODO, update $('#swimmers-list') with <li>s of swimmers
}

$(document).ready(() => {
    $.ajaxSetup({cache: false});

    $('#start-camera-button').click(startCamera);
    $('#add-swimmer-input-button').click(() => {
        addSwimmer($('#add-swimmer-input').val());
        $('#add-swimmer-input').val('');
        $('#add-swimmer-input').focus();
    });
    $('#show-add-swimmer').click(showAddSwimmerDiv);
    $('#add-swimmer-back').click(hideAddSwimmerDiv);

    updateSwimmersFromCookies();
});
