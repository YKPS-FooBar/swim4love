/**
 * A large portion of this code is copied from <https://github.com/serratus/quaggaJS/blob/master/example/live_w_locator.js>
 */

if (!Cookies.get('swimmers')) {
    Cookies.set('swimmers', []);
}

var idsToNames = {};

// var isCameraOn = false;

// // config, for Quagga.init(config, callback)
// var config = {
//     inputStream: {
//         name: 'Live',
//         type: 'LiveStream',
//         // Constraints for the video camera, pretty self explanatory
//         // Check <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Parameters>
//         // for possible values
//         constraints: {
//             width: {min: 640},
//             height: {min: 480},
//             facingMode: 'environment',
//             aspectRatio: {min: 1, max: 2}
//         },
//         // <div> to show video & canvas
//         target: document.querySelector('#barcode-scanner')
//     },
//     locator: {
//         // Size of a barcode relative to screen
//         // Reckon that medium is about right
//         patchSize: 'medium',
//         // Subsampling picture to half of resolution
//         halfSample: true
//     },
//     // Number of workers, can be set to / analogous to number of cores of CPU
//     numOfWorkers: 4,
//     // Maximum number of scans per second
//     frequency: 5,
//     decoder: {readers: ['code_128_reader']},
//     // To locate the barcode on image
//     locate: true
// };

// function startCamera() {
//     isCameraOn = true;
//     $('#barcode-scanner').show();
//     // init, see <https://github.com/serratus/quaggaJS#quaggainitconfig-callback>
//     Quagga.init(config, error => {
//         if (error) {
//             console.log(error);
//         } else {
//             // TD, see if the camera is able to zoom or turn on torch: (check <https://serratus.github.io/quaggaJS/#tipsandtricks>)
//             //   var track = Quagga.CameraAccess.getActiveTrack();
//             //   if (typeof track.getCapabilities === 'function') {
//             //       var capabilities = track.getCapabilities();
//             //   } else {
//             //       var capabilities = {};
//             //   }
//             // capabilities.torch would be true if torch is available
//             // capabilities.zoom would require you to check the documentation
//             // to zoom, track.applyConstraints({advanced: [{zoom: parseFloat(value)}]});
//             // to torch, track.applyConstraints({advanced: [{torch: !!value}]});
//             // TD, allow user to choose video device from Quagga.enumerateVideoDevices().then(devices => {do something with device names; check documentation})
//             //       (label for default device is Quagga.CameraAccess.getActiveStreamLabel())
//             Quagga.start()
//         }
//     });

//     // 'result' looks like <https://github.com/serratus/quaggaJS#the-result-object>.
//     // When detected, stop camera and log
//     Quagga.onDetected(result => {
//         if (!isCameraOn) {
//             console.log(`Detected swimmer #${id}, but the camera has already detected something else`)
//             return;
//         }
//         // We set it to false beforehand to prevent
//         // multiple onDetected called in a very short interval
//         // and since updateNameFromServer takes time
//         isCameraOn = false;
//         var id = result.codeResult.code.toString();
//         updateNameFromServer(id).done(result => {
//             if (result.code === 0) {
//                 // The scanned swimmer is on the list of swimmers on the server
//                 Quagga.stop();
//                 $('#barcode-scanner').hide();
//                 addSwimmer(id);
//             } else {
//                 // Something was scanned from the webcam that is not on the swimmers list on the server
//                 // TD, visual error message
//                 alert(`游泳者#${id}没有登记`)
//                 isCameraOn = true;
//             }
//         });
//     });
// }

function addSwimmer(id) {
    // This function temporarily allows IDs that are not on server,
    // since checking if they are on server takes time and is asynchronous,
    // and updateSwimmersListFromCookies checks if the ID is on the server anyways
    if (!isValidId(id)) {
        // TODO, visual error message
        alert(id + ' 格式不正确');
        return;
    }
    console.log(`Added swimmer #${id}`);
    // Normally, id won't be in getSwimmers
    // But just in case it is, we bring it to the top of the list to show the volunteer
    var swimmers = getSwimmers().filter(idFromCookies => idFromCookies !== id);
    swimmers.unshift(id);
    setSwimmers(swimmers);

    updateSwimmersListFromCookies();
    hideAddSwimmerDiv();
}

function updateNameFromServer(id) {
    return $.getJSON(`/swimmer/info/${id}`).done(response => {
        var code = response.code;
        if (code === 0) {
            idsToNames[id] = response.data.name;
        } else if (id in idsToNames) {
            delete idsToNames[id];
        }
    });
}

function isValidId(id) {
    return /^[0-9][0-9][0-9]$/.test(id);
}

function showAddSwimmerDiv() {
    // startCamera();
    $('#add-swimmer').show();
    $('#swimmers').hide();
    $('#add-swimmer-input').focus();
}

function hideAddSwimmerDiv() {
    // isCameraOn = false;
    // Quagga.stop();
    // $('#barcode-scanner').hide();
    $('#add-swimmer').hide();
    $('#swimmers').show();
    $('#add-swimmer-input').val('');
}

function updateLaps(id) {
    return updateNameFromServer(id).done(response => {
        $(`#swimmer-${id} .swimmer-lap-count`).html(response.data.laps + ' 圈');
    });
}

function appendSwimmerToList(id) {
    var $swimmerItem = $('<div>').attr('id', `swimmer-${id}`).addClass('swimmer-item');
    $('<img>').attr('src', `/swimmer/avatar/${id}`).addClass('swimmer-avatar').appendTo($swimmerItem);
    var $swimmerNameItem = $('<div>').css('width', 'calc(80% - 115px)').appendTo($swimmerItem);
    $('<p>').html('#' + id).addClass('swimmer-id').appendTo($swimmerNameItem);
    $('<p>').html(idsToNames[id]).addClass('swimmer-name').appendTo($swimmerNameItem);
    $('<p>').addClass('swimmer-lap-count').appendTo($swimmerNameItem);
    updateLaps(id);
    var $swimmerButtonsItem = $('<div>').width(105).appendTo($swimmerItem);
    $('<span>').addClass('swimmer-button fas fa-trash').appendTo($swimmerButtonsItem).click(() => {
        setSwimmers(getSwimmers().filter(idFromCookies => idFromCookies !== id));
        updateSwimmersListFromCookies();
    });
    $('<span>').addClass('swimmer-button fas fa-minus').appendTo($swimmerButtonsItem).click(() => {
        $.post('/swimmer/sub-lap', {id: id}, () => {
            console.log(`1 lap subtracted from swimmer #${id}`);
        }).done(() => updateLaps(id));
    });
    $('<span>').addClass('swimmer-button fas fa-plus').appendTo($swimmerButtonsItem).click(() => {
        $.post('/swimmer/add-lap', {id: id}, () => {
            console.log(`1 lap added to swimmer #${id}`);
        }).done(() => updateLaps(id));
    });
    $swimmerItem.appendTo('#swimmers-list');
}

function updateSwimmersListFromCookies() {
    $('#swimmers-list').html('');
    var swimmers = getSwimmers();
    swimmers.forEach(id => {
        // appendSwimmerToList requires id to be in idsToNames
        if (id in idsToNames) {
            appendSwimmerToList(id);
        } else {
            updateNameFromServer(id).done(result => {
                if (result.code === 0) {
                    // updateNameFromServer will put id: name into idsToNames
                    appendSwimmerToList(id);
                } else {
                    swimmers.splice(swimmers.indexOf(id), 1);
                    setSwimmers(swimmers);
                    // TODO, visual error message
                    alert(`游泳者#${id}没有登记`)
                }
            });
        }
    })
}

function getSwimmers() {
    return JSON.parse(Cookies.get('swimmers'));
}

function setSwimmers(swimmersList) {
    // js-cookie automatically converts arrays / objects to URL-encoded JSONified strings
    return Cookies.set('swimmers', swimmersList, {expires: 7, path: '/'});
}

$(document).ready(() => {
    $.ajaxSetup({cache: false});

    $('#add-swimmer-input').keyup(() => {
        if (isValidId($('#add-swimmer-input').val())) {
            addSwimmer($('#add-swimmer-input').val());
            $('#add-swimmer-input').val('').focus();
        }
    });
    $('#show-add-swimmer').click(showAddSwimmerDiv);
    $('#add-swimmer-back').click(hideAddSwimmerDiv);

    updateSwimmersListFromCookies();
});
