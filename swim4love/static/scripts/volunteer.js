/**
 * Common code for volunteer & admin management
 */

var swimmers = {};

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

//         var id = result.codeResult.code.toString();
//         if (isValidId(id)) {
//             // We set it to false beforehand to prevent
//             // multiple onDetected called in a very short interval
//             // and since linkSwimmer takes time
//             isCameraOn = false;
//             linkSwimmer(id, true).done(result => {
//                 if (result.code === 0) {
//                     // The scanned swimmer is added
//                     Quagga.stop();
//                     $('#barcode-scanner').hide();
//                 } else {
//                     // Something was scanned from the webcam that is not on the swimmers list on the server
//                     isCameraOn = true;
//                 }
//             });
//         }
//     });
// }

function post(url, payload, callback) {
    return $.post(url, payload, 'json').done(response => {
        if (response.code === 0) {
            callback(response.data);
        } else {
            alert(response.msg);
        }
    }).fail(() => {
        alert('网络错误，请重试');
    });
}

function linkSwimmer(id) {
    return post('/volunteer/link-swimmer', {id: id}, data => {
        console.log(`Linked swimmer #${id}`);
        swimmers[id] = data;
        updateSwimmers();
    }).always(() => {
        hideLinkSwimmerDiv();
    });
}

function unlinkSwimmer(id) {
    return post('/volunteer/unlink-swimmer', {id: id}, () => {
        console.log(`Unlinked swimmer #${id}`);
        delete swimmers[id];
        updateSwimmers();
    });
}

function addSwimmer(id, name) {
    return post('/swimmer/add', {id: id, name: name}, data => {
        console.log(`Added new swimmer #${id}`);
        swimmers[id] = data;
        updateSwimmers();
    }).always(() => {
        hideAddSwimmerDiv();
    });
}

function deleteSwimmer(id) {
    return post('/swimmer/delete', {id: id}, () => {
        console.log(`Deleted swimmer #${id}`);
        delete swimmers[id];
        updateSwimmers();
    })
}

function updateName(id, name) {
    return post('/swimmer/update-name', {id: id, name: name}, data => {
        console.log(`Updated swimmer #${id} name to ${name}`);
        swimmers[id] = data;
        updateSwimmers();
    }).always(() => {
        hideUpdateSwimmerDiv();
    });
}

function isValidId(id) {
    return /^[0-9][0-9][0-9]$/.test(id);
}

function updateSwimmer(id, data) {
    $(`#swimmer-${id} .swimmer-name`).text(data.name);
    $(`#swimmer-${id} .swimmer-lap-count`).text(data.laps + ' 圈');
}

function updateSwimmers() {
    $('#swimmers-list').html('');
    // Each button is ~35px wide; admin has an additional edit button
    const buttonsWidth = 35 * (admin ? 4 : 3);
    for (const id in swimmers) {
        var $swimmerItem = $('<div>').attr('id', `swimmer-${id}`).addClass('swimmer-item');
        var $swimmerNameItem = $('<div>').css('width', `calc(100% - ${buttonsWidth}px)`).appendTo($swimmerItem);
        $('<p>').html('#' + id).addClass('swimmer-id').appendTo($swimmerNameItem);
        $('<p>').addClass('swimmer-name').appendTo($swimmerNameItem);
        $('<p>').addClass('swimmer-lap-count').appendTo($swimmerNameItem);

        var $swimmerButtonsItem = $('<div>').width(buttonsWidth).appendTo($swimmerItem);

        if (admin) {
            $('<span>').addClass('swimmer-button fas fa-trash-alt').appendTo($swimmerButtonsItem).click(() => {
                if (confirm(`确定删除游泳者#${id}吗？`)) {
                    deleteSwimmer(id);
                }
            });
        } else {
            $('<span>').addClass('swimmer-button fas fa-unlink').appendTo($swimmerButtonsItem).click(() => {
                if (confirm(`确定与游泳者#${id}取消关联吗？`)) {
                    unlinkSwimmer(id);
                }
            });
        }

        $('<span>').addClass('swimmer-button fas fa-minus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/sub-lap', {id: id}, data => {
                console.log(`1 lap subtracted from swimmer #${id}`);
                updateSwimmer(id, data);
            });
        });

        $('<span>').addClass('swimmer-button fas fa-plus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/add-lap', {id: id}, data => {
                console.log(`1 lap added to swimmer #${id}`);
                updateSwimmer(id, data);
            });
        });

        if (admin) {
            $('<span>').addClass('swimmer-button fas fa-pen').appendTo($swimmerButtonsItem).click(() => {
                showUpdateSwimmerDiv(id);
            });
        }

        $swimmerItem.appendTo('#swimmers-list');

        updateSwimmer(id, swimmers[id]);
    }
}

function inputNext(next) {
    $('#' + next).focus();
}

function submitLinkSwimmer() {
    const inputId = $('.input-digit').toArray().map(e => $(e).val()).join('');
    if (isValidId(inputId)) {
        linkSwimmer(inputId);
    }
}

function submitAddSwimmer(event) {
    const inputId = $('.input-digit').toArray().map(e => $(e).val()).join('');
    const name = $('#add-swimmer-name').val();
    if (isValidId(inputId)) {
        addSwimmer(inputId, name);
    }
    event.preventDefault();
}

function submitUpdateSwimmer(event) {
    const name = $('#update-swimmer-name').val();
    const id = $('#update-swimmer-id').val();
    updateName(id, name);
    event.preventDefault();
}

function showLinkSwimmerDiv() {
    // startCamera();
    $('#link-swimmer').show();
    $('#swimmers').hide();
    $('.input-digit#1').focus();
}

function hideLinkSwimmerDiv() {
    // isCameraOn = false;
    // Quagga.stop();
    // $('#barcode-scanner').hide();
    $('#link-swimmer').hide();
    $('#swimmers').show();
    $('.input-digit').val('');
}

function showAddSwimmerDiv() {
    // startCamera();
    $('#add-swimmer').show();
    $('#swimmers').hide();
    $('.input-digit#1').focus();
}

function hideAddSwimmerDiv() {
    // isCameraOn = false;
    // Quagga.stop();
    // $('#barcode-scanner').hide();
    $('#add-swimmer').hide();
    $('#swimmers').show();
    $('.input-digit').val('');
}

function showUpdateSwimmerDiv(id) {
    $('#update-swimmer').show();
    $('#swimmers').hide();
    $('#update-swimmer-id').val(id);
    $('#update-swimmer-name').focus();
}

function hideUpdateSwimmerDiv() {
    $('#update-swimmer').hide();
    $('#swimmers').show();
    $('#update-swimmer-name').val('');
}

$(document).ready(() => {
    $.ajaxSetup({cache: false});

    if (admin) {
        $('#show-add-swimmer').click(showAddSwimmerDiv);
        $('#add-swimmer-back').click(hideAddSwimmerDiv);
        $('#add-swimmer').submit(submitAddSwimmer);

        $('#update-swimmer-back').click(hideUpdateSwimmerDiv);
        $('#update-swimmer').submit(submitUpdateSwimmer);

        $.getJSON('/swimmer/all').done(response => {
            for (const id in response.data) {
                swimmers[id.toString().padStart(3, '0')] = response.data[id];
            }
            updateSwimmers();
        });
    } else {
        $('#show-link-swimmer').click(showLinkSwimmerDiv);
        $('#link-swimmer-back').click(hideLinkSwimmerDiv);

        $.getJSON('/volunteer/swimmers').done(response => {
            for (const id in response.data) {
                swimmers[id.toString().padStart(3, '0')] = response.data[id];
            }
            updateSwimmers();
        });
    }
});
