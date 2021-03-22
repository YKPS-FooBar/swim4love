/**
 * Main script file for the large screen
 */

let socket; // for websocket receiving data
let leaderboard; // for actual displaying
let topTen; // for updating
let previousData = {}; // for checking changes
// A mapping from `id` to a Date.now() that records the time of last change
let timestamp = {};


$(document).ready(() => {
    if (!($(document).width() === 1920 && $(document).height() === 1080)) console.warn('Your screen dimensions might not be optimized to display this page. Consider changing to a 1920×1080 size.');
    $.ajaxSetup({cache: false}); // no cache
    initLeaderboard();
    socket = io.connect(window.location.origin);
    socket.on('init', raw => process_data(raw, () => topTen.forEach((e, i) => insert_player(e, null, i))));
    socket.on('swimmers', process_data);
    leaderboard = [];

    // setTimeout(() => window.location.reload(), 8000);
});


function process_data(raw, callback=update_leaderboard) {
    // `raw` is {id: {id: 123, name: 'Name', laps: 10}, ...}
    // `data` is [{id: '123', name: 'Name', laps: 10}, ...]
    let data = Object.values(raw).map(swimmer => Object({
        id: swimmer.id.toString(),
        name: swimmer.name,
        laps: swimmer.laps
    }));

    data.forEach((e, i) => {
        let id = e.id
        // If the `laps` is updated or `timestamp[id]` is yet to be created,
        // set value for timestamp[id]
        if (timestamp[id] === undefined || (previousData[id] !== undefined && e.laps !== previousData[id])) {
            timestamp[id] = Date.now() + i;
        }
    });
    // Sort `data` according to laps -> timestamp
    data.sort((a, b) => a.laps > b.laps ? -1 : (a.laps < b.laps ? 1 : timestamp[a.id] < timestamp[b.id] ? -1 : 1));

    let newTotal;
    if (data.length === 0) {
        newTotal = 0;
    } else {
        newTotal = data.map(e => e.laps).reduce((a, b) => a + b);
    }
    tally(newTotal);

    topTen = data.slice(0, 10);
    callback();
    leaderboard = topTen;
    data.forEach((e, i) => {
        previousData[e.id] = e.laps;
    });
}


function update_leaderboard() {
    let leaderboardIds = leaderboard.map(e => e.id);
    let topTenIds = topTen.map(e => e.id);
    leaderboard.forEach(e => {
        let id = e.id;
        if (!topTenIds.includes(id)) remove_player(id); // fell out of leaderboard
    });
    topTen.forEach((e, i) => {
        let id = e.id;
        let laps = e.laps;
        if (!leaderboardIds.includes(id)) { // a new player
            insert_player(e, null, i, false);
            return;
        }

        if (laps !== previousData[id]) {
            change_number($(`#${id} .laps`), laps);
            change_number($(`#${id} .meters`), laps * LAP_LENGTH);
        }
        change_rank(id, i);
    });
}


function tally(newTotal) {
    change_number($('.tally.laps.num'), newTotal);
    change_number($('.tally.meters.num'), newTotal * LAP_LENGTH);
}


function change_number(element, updated) {
    element.prop('counter', parseInt(element.text())).animate(
        {
            // a dummy counter
            counter: updated
        },
        {
            // how long the animation would be
            duration: METER_UPDATE_SPAN,
            // which easing function to use
            easing: 'swing',
            // update text each step
            step: now => element.text(Math.ceil(now))
        }
    );
}
