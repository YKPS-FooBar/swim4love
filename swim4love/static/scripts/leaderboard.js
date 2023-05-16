/**
 * Main script file for the large screen
 */

let socket; // for websocket receiving data
let leaderboard; // for actual displaying
let topTen; // for updating
let previousData = {}; // for checking changes
// A mapping from `id` to a Date.now() that records the time of last change
let timestamp = {};

// ID input from the barcode scanner
let inputText = '';


$(document).ready(() => {
    if (!($(document).width() === 1920 && $(document).height() === 1080)) console.warn('Your screen dimensions might not be optimized to display this page. Consider changing to a 1920×1080 size.');
    $.ajaxSetup({cache: false}); // no cache
    initLeaderboard();
    window.addEventListener('resize', () => window.location.reload(), false);
    socket = io.connect(window.location.origin);
    socket.on('init', raw => process_data(raw, () => topTen.forEach((e, i) => insert_player(e, null, i))));
    socket.on('swimmers', process_data);
    leaderboard = [];

    // Barcode input ID -> takes to the achievement page
    $(document.body).keydown(e => {
        const inputChar = String.fromCharCode(e.which);
        const lastThreeInput = inputText.slice(-3);
        // Barcode input is like "123return"
        // If return pressed & the last 3 characters are numbers
        if ('\r\n'.includes(inputChar) && /^[0-9][0-9][0-9]$/.test(lastThreeInput)) {
            window.location.href = `/achievement/${inputText.slice(-3)}`;
        } else {
            inputText += inputChar;
        }
    });
});


function process_data(raw, callback=update_leaderboard) {
    // `raw` is {id: {id: 123, name: 'Name', ...}, ...}
    // `data` is [{id: '123', name: 'Name', ...}, ...]
    let data = Object.values(raw).map(swimmer => Object({
        id: swimmer.id.toString(),
        name: swimmer.name,
        swim_laps: swimmer.swim_laps,
        run_laps: swimmer.run_laps,
        challenges: swimmer.challenges,
        points: swimmer.points
    }));

    data.forEach((e, i) => {
        let id = e.id
        // If the `points` is updated or `timestamp[id]` is yet to be created,
        // set value for timestamp[id]
        if (timestamp[id] === undefined || (previousData[id] !== undefined && e.points !== previousData[id])) {
            timestamp[id] = Date.now() + i;
        }
    });
    // Sort `data` according to points -> timestamp
    data.sort((a, b) => a.points > b.points ? -1 : (a.points < b.points ? 1 : timestamp[a.id] < timestamp[b.id] ? -1 : 1));

    if (data.length === 0) {
        tally(0,0,0,0);
    } else {
        tally(
            data.map(e => e.points).reduce((a, b) => a + b),
            data.map(e => e.swim_laps).reduce((a, b) => a + b),
            data.map(e => e.run_laps).reduce((a, b) => a + b),
            data.map(e => e.challenges).reduce((a, b) => a + b)
        );
    }

    topTen = data.slice(0, 10);
    callback();
    leaderboard = topTen;
    data.forEach((e, i) => {
        previousData[e.id] = e.points;
    });
}


let leaderWidth; // width of leaderboard

function update_leaderboard() {
    let leaderboardIds = leaderboard.map(e => e.id);
    let topTenIds = topTen.map(e => e.id);
    leaderboard.forEach(e => {
        let id = e.id;
        if (!topTenIds.includes(id)) remove_player(id); // fell out of leaderboard
    });
    topTen.forEach((e, i) => {
        let id = e.id;
        let name = e.name;
        let points = e.points;
        if (!leaderboardIds.includes(id)) { // a new player
            insert_player(e, null, i, false);
            return;
        }

        // in case the name changes mid-event
        $(`#${id} .name`).text(name);

        if (points !== previousData[id]) {
            change_number($(`#${id} .points`),      e.points);
            change_number($(`#${id} .challenges`),  e.challenges);
            change_number($(`#${id} .swim_meter`),  e.swim_laps * SWIM_LAP_LENGTH);
            change_number($(`#${id} .run_meter`),   e.run_laps  * RUN_LAP_LENGTH );
        }
        change_rank(id, i);
    });
}


function tally(points, swim_laps, run_laps, challenges) {
    change_number($('.tally.points.num'), points);
    change_number($('.tally.meters.swim.num'), swim_laps * SWIM_LAP_LENGTH);
    change_number($('.tally.meters.run.num'), run_laps * RUN_LAP_LENGTH);
    change_number($('.tally.challenges.num'), challenges);
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


function initLeaderboard() {
    // Align elements
    leaderWidth = $('.leaderboard').width();
    for (let i = 1; i <= LEADER_COLS_WIDTH.length; i++) {
        $(`.leader-title > :nth-child(${i})`).css('left', LEADER_COLS_WIDTH[i - 1] * leaderWidth);
        $(`.participant > :nth-child(${i})`).css('left', LEADER_COLS_WIDTH[i] * leaderWidth);
    }
    for (let i = 1; i <= 10; i++) {
        $(`.participant:nth-child(${i}) *`).css('top', i * LEADER_LINE_HEIGHT);
    }
}

function get_rank(points, compareArray=topTen) {
    for (var i = 0; i < compareArray.length; i++) if (points >= compareArray[i].points) return i;
    return null;
}

function remove_player(id) {
    $(`#${id} *`).css('top', 800);
    $(`#${id} *`).css('opacity', 0);
    setTimeout(() => $(`#${id}`).remove(), 800);
}

function insert_player(player, compareArray=leaderboard, insertRank=null, init=true) {
    // Get info of player using UID
    let name = player.name;
    let id = player.id;
    // swimmers who haven't swum should also be on the list
    // if (points === 0) return;
    let swim_distance = player.swim_laps * SWIM_LAP_LENGTH;
    let run_distance = player.run_laps * RUN_LAP_LENGTH;
    let challenges = player.challenges;
    let points = player.points;
    let rank = (![null, undefined, NaN].includes(insertRank)) ? insertRank : get_rank(points, compareArray);
    let initPos = init ? (rank + 2) * LEADER_LINE_HEIGHT : 800; // for rise up animation
    $('.leaderboard').append(`
        <div class='participant' id='${id}' data-rank='${rank}'>
            <span class='name'       style='top: ${initPos}px; opacity: 0;'>${name}</span>
            <span class='swim_meter' style='top: ${initPos}px; opacity: 0;'>${swim_distance}</span>
            <span class='run_meter'  style='top: ${initPos}px; opacity: 0;'>${run_distance}</span>
            <span class='challenges' style='top: ${initPos}px; opacity: 0;'>${challenges}</span>
            <span class='points'     style='top: ${initPos}px; opacity: 0;'>${points}</span>
        </div>`);
    // Align elements
    for (let i = 1; i <= LEADER_COLS_WIDTH.length; i++) {
        $(`#${id} :nth-child(${i})`).css('left', LEADER_COLS_WIDTH[i] * leaderWidth);
    }
    // Rise up
    setTimeout(() => {
        $(`#${id} *`).css('top', (rank + 1) * LEADER_LINE_HEIGHT);
        $(`#${id} *`).css('opacity', 1);
    });
}

function change_rank(id, newRank) {
    if (newRank >= topTen.length || newRank < 0) {
        console.warn(`Cannot change player ${id} to rank ${newRank}`);
        return;
    };
    if (parseInt($(`#${id}`).attr('data-rank')) === newRank) return;
    // Move this player to new position
    $(`#${id} *`).css('top', (newRank + 1) * LEADER_LINE_HEIGHT);
    $(`#${id}`).attr('data-rank', newRank);
}
