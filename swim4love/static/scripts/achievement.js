let currentLaps = 0;

function setStat(element, to, span=ACHIEVEMENT_SET_STAT_TIMEOUT) {
    let current = parseInt(element.text());
    if (current === to) return;
    element.prop('counter', current).animate({counter: to}, {
        duration: span,
        easing: 'swing',
        step: now => element.text(Math.ceil(now))
    });
}

function setBackground(laps) {
    if (laps < BRONZE_MEDAL_LAP_COUNT){
        document.getElementById("bg").style.background = NO_MEDAL_BG;
    }
    else if (laps >= BRONZE_MEDAL_LAP_COUNT && laps < SILVER_MEDAL_LAP_COUNT) {
        document.getElementById("bg").style.background = BRONZE_MEDAL_BG;
    }
    else if (laps >= SILVER_MEDAL_LAP_COUNT && laps < GOLD_MEDAL_LAP_COUNT) {
        document.getElementById("bg").style.background = SILVER_MEDAL_BG;
    }
    else if (laps >= GOLD_MEDAL_LAP_COUNT){
        document.getElementById("bg").style.background = GOLD_MEDAL_BG;
    }

}

function updateData() {
    $.getJSON(`/swimmer/info/${id}`, raw => {
        if (raw.code === 0) { // success
            setBackground(raw.data.laps);
            $('#name').text(raw.data.name);
            setStat($('#laps'), raw.data.laps);
            setStat($('#meters'), raw.data.laps * LAP_LENGTH);
            document.title = `${raw.data.name} | Swim For Love`;
        } else { // if error, print message
            setBackground(0);
            $('#name').text(raw.msg);
            $('#laps').parent().remove();
            $('#meters').parent().remove();
        }
    });
}

function backToLeaderboard() {
    window.location.href = '/leaderboard';
}

$(document).ready(() => {
    $.ajaxSetup({cache: false}); // no cache
 
    updateData();
    setInterval(updateData, 2000);

    setTimeout(backToLeaderboard, ACHIEVEMENT_PAGE_TIMEOUT);
    $(document.body).on('mousedown keydown', backToLeaderboard);
});
