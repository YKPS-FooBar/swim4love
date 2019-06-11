let leaderWidth;

function initLeaderboard() {
    // Align elements
    leaderWidth = $('.leaderboard').width();
    for (let i = 1; i <= LEADER_COLS_WIDTH.length; i++) {
        $(`.leader-title :nth-child(${i})`).css('left', LEADER_COLS_WIDTH[i - 1] * leaderWidth);
        $(`.participant :nth-child(${i})`).css('left', LEADER_COLS_WIDTH[i] * leaderWidth);
    }
    for (let i = 1; i <= 10; i++) {
        $(`.participant:nth-child(${i}) *`).css('top', i * LEADER_LINE_HEIGHT);
    }
}

function get_rank(laps, compareArray=topTen) {
    for (var i = 0; i < compareArray.length; i++) if (laps >= compareArray[i].laps) return i;
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
    let laps = player.laps;
    let id = player.id;
    if (laps === 0) return;
    let meters = laps * LAP_LENGTH;
    let rank = (![null, undefined, NaN].includes(insertRank)) ? insertRank : get_rank(laps, compareArray);
    let initPos = init ? (rank + 2) * LEADER_LINE_HEIGHT : 800; // for rise up animation
    $('.leaderboard').append(`<div class='participant' id='${id}' data-rank='${rank}'><span class='name' style='top: ${initPos}px; opacity: 0;'>${name}</span><span class='laps' style='top: ${initPos}px; opacity: 0;'>${laps}</span><span class='meters' style='top: ${initPos}px; opacity: 0;'>${meters}</span></div>`);
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
