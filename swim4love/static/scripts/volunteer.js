/**
 * Common code for volunteer & admin management
 */

let swimmers = {};
let volunteers = {};

// let isCameraOn = false;

// // config, for Quagga.init(config, callback)
// let config = {
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


/********************* API calling functions *********************/

function post(url, payload, callback) {
    return $.post(url, payload, 'json').done(response => {
        if (typeof response === 'string') {
            // This means that text rather than JSON is returned from a POST
            // which probably means that this request is redirected to an HTML page
            // which probably means that the user is not privileged to access this API
            // (e.g. user session timed out; user was deleted; user was de-escalated)
            // so that Flask-Login redirects it to /login
            // which probably means that we should try to reload this page
            // to let the user log in again
            window.location.reload();
            return;
        }

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
        updateSwimmer(id);
    }).always(() => {
        hideUpdateSwimmerDiv();
    });
}

function deleteVolunteer(username) {
    return post('/volunteer/delete', {username: username}, () => {
        console.log(`Deleted volunteer ${username}`);
        delete volunteers[username];
        updateVolunteers();
    });
}

function addVolunteer(username, password, isAdmin) {
    return post('/volunteer/add', {username: username, password: password, 'is-admin': isAdmin}, data => {
        console.log(`Added volunteer ${username}`);
        volunteers[username] = data;
        updateVolunteers();
    }).always(() => {
        hideAddVolunteerDiv();
    });
}


/********************* Update swimmer & volunteer list functions *********************/

function updateSwimmer(id) {
    const data = swimmers[id];
    $(`#swimmer-${id} .list-item-name`).text(data.name);
    $(`#swimmer-${id} .list-item-details`).text(data.swim_laps + ' 圈(游泳) + ' + data.run_laps + ' 圈(跑步) + ' + data.challenges + ' 个挑战');
}

function updateSwimmers() {
    $('#swimmers-list').html('');
    for (const id of Object.keys(swimmers).sort()) {
        var $swimmerItem = $('<div>').attr('id', `swimmer-${id}`).addClass('list-item');

        var $swimmerNameItem = $('<div>').addClass('list-item-name-container').appendTo($swimmerItem);
        $('<p>').html('#' + id).addClass('list-item-id').appendTo($swimmerNameItem);
        $('<p>').addClass('list-item-name').appendTo($swimmerNameItem);
        $('<p>').addClass('list-item-details').appendTo($swimmerNameItem);

        var $swimmerButtonsItem = $('<div>').addClass('list-item-buttons-container').appendTo($swimmerItem);

        if (admin) {
            $('<span>').addClass('list-item-button fas fa-pen').appendTo($swimmerButtonsItem).click(() => {
                showUpdateSwimmerDiv(id);
            });
        }

        $('<span>').addClass('list-item-button fas fa-plus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/add-lap', {id: id, type: "swim"}, data => {
                console.log(`1 swim lap added to swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        $('<span>').addClass('list-item-button fas fa-minus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/sub-lap', {id: id, type: "swim"}, data => {
                console.log(`1 swim lap subtracted from swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        $('<span>').addClass('list-item-button fas fa-plus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/add-lap', {id: id, type: "run"}, data => {
                console.log(`1 run lap added to swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        $('<span>').addClass('list-item-button fas fa-minus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/sub-lap', {id: id, type: "run"}, data => {
                console.log(`1 lap subtracted from swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        $('<span>').addClass('list-item-button fas fa-plus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/add-lap', {id: id, type: "challenge"}, data => {
                console.log(`1 challenge added to swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        $('<span>').addClass('list-item-button fas fa-minus').appendTo($swimmerButtonsItem).click(() => {
            post('/swimmer/sub-lap', {id: id, type: "challenge"}, data => {
                console.log(`1 challenge subtracted from swimmer #${id}`);
                swimmers[id] = data;
                updateSwimmer(id);
            });
        });

        if (admin) {
            $('<span>').addClass('list-item-button fas fa-trash-alt').appendTo($swimmerButtonsItem).click(() => {
                if (confirm(`确定删除游泳者#${id}吗？`)) {
                    deleteSwimmer(id);
                }
            });
        } else {
            $('<span>').addClass('list-item-button fas fa-unlink').appendTo($swimmerButtonsItem).click(() => {
                if (confirm(`确定与游泳者#${id}取消关联吗？`)) {
                    unlinkSwimmer(id);
                }
            });
        }

        $swimmerItem.appendTo('#swimmers-list');

        updateSwimmer(id);
    }
}

function updateVolunteers() {
    $('#volunteers-list').html('');
    for (const username of Object.keys(volunteers).sort()) {
        var $volunteerItem = $('<div>').attr('id', `volunteer-${username}`).addClass('list-item');

        var $volunteerNameItem = $('<div>').addClass('list-item-name-container').appendTo($volunteerItem);
        $('<p>').addClass('list-item-name').text(username).css('font-weight', volunteers[username].isAdmin ? '600' : '400').appendTo($volunteerNameItem);

        var $volunteerButtonsItem = $('<div>').addClass('list-item-buttons-container').appendTo($volunteerItem);

        $('<span>').addClass('list-item-button fas fa-user-minus').appendTo($volunteerButtonsItem).click(() => {
            if (confirm(`确定删除志愿者 ${username} 吗？`)) {
                deleteVolunteer(username);
            }
        });

        $volunteerItem.appendTo('#volunteers-list');
    }
}


/********************* On submit/input functions *********************/

function isValidId(id) {
    return /^[0-9][0-9][0-9]$/.test(id);
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

function submitAddVolunteer(event) {
    const username = $('#add-volunteer-username').val();
    const password = $('#add-volunteer-password').val();
    const isAdmin = $('#add-volunteer-is-admin').prop('checked');
    addVolunteer(username, password, isAdmin);
    event.preventDefault();
}


/********************* Show & hide div functions *********************/

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
    $('#add-swimmer-name').val('');
}

function showUpdateSwimmerDiv(id) {
    $('#update-swimmer').show();
    $('#swimmers').hide();
    $('#update-swimmer-id').val(id);
    $('#update-swimmer-name').val(swimmers[id].name).focus();
}

function hideUpdateSwimmerDiv() {
    $('#update-swimmer').hide();
    $('#swimmers').show();
    $('#update-swimmer-name').val('');
}

function showAddVolunteerDiv() {
    $('#add-volunteer').show();
    $('#swimmers').hide();
    $('#add-volunteer-username').focus();
}

function hideAddVolunteerDiv() {
    $('#add-volunteer').hide();
    $('#swimmers').show();
    $('#add-volunteer-username').val('');
    $('#add-volunteer-password').val('');
    $('#add-volunteer-is-admin').prop('checked', false);
}


/********************* Sync swimmers *********************/

function syncSwimmers() {
    if (admin) {
        $.getJSON('/swimmer/all').done(response => {
            for (const id in response.data) {
                swimmers[id.toString().padStart(3, '0')] = response.data[id];
            }
            updateSwimmers();
        });
        $.getJSON('/volunteer/all').done(response => {
            for (const username in response.data) {
                volunteers[username] = response.data[username];
            }
            updateVolunteers();
        })
    } else {
        $.getJSON('/volunteer/swimmers').done(response => {
            for (const id in response.data) {
                swimmers[id.toString().padStart(3, '0')] = response.data[id];
            }
            updateSwimmers();
        });
    }
}


/********************* Search swimmers *********************/

let allSwimmers;

function searchSwimmers() {
    allSwimmers = $.extend({}, swimmers);
    $('#swimmers-heading').hide();
    $('#swimmers-search-input').show().focus();
}

function inputSearchSwimmers() {
    const query = $('#swimmers-search-input').val().toLowerCase();
    if (query === '' && !$('#swimmers-search-input').is(':focus')) {
        swimmers = $.extend({}, allSwimmers);
        $('#swimmers-search-input').hide();
        $('#swimmers-heading').show();
    } else {
        swimmers = Object.fromEntries(
            Object.entries(allSwimmers).filter(entry => entry[0].indexOf(query) !== -1 || entry[1].name.toLowerCase().indexOf(query) !== -1)
        );
    }
    updateSwimmers();
}


/********************* Setup *********************/

$(document).ready(() => {
    $.ajaxSetup({cache: false});

    if (admin) {
        $('#show-add-swimmer').click(showAddSwimmerDiv);
        $('#add-swimmer-back').click(hideAddSwimmerDiv);
        $('#add-swimmer').submit(submitAddSwimmer);

        $('#update-swimmer-back').click(hideUpdateSwimmerDiv);
        $('#update-swimmer').submit(submitUpdateSwimmer);

        $('#show-add-volunteer').click(showAddVolunteerDiv);
        $('#add-volunteer-back').click(hideAddVolunteerDiv);
        $('#add-volunteer').submit(submitAddVolunteer);

        $('#swimmers-refresh').click(syncSwimmers);
        $('#swimmers-search').click(searchSwimmers);
        $('#swimmers-search-input').on('input blur', inputSearchSwimmers);
    } else {
        $('#show-link-swimmer').click(showLinkSwimmerDiv);
        $('#link-swimmer-back').click(hideLinkSwimmerDiv);
    }

    syncSwimmers();
});
