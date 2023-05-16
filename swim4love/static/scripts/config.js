// For leaderboard
const SWIM_LAP_LENGTH   = 50; // in meters
const SWIM_LAP_SCORE    = 200;
const RUN_LAP_LENGTH    = 300;
const RUN_LAP_SCORE     = 300;
const CHALLENGE_SCORE   = 4000;

const METER_UPDATE_SPAN = 400; // in milliseconds
const LEADER_COLS_WIDTH = [0, 0.08, 0.40, 0.52, 0.64, 0.85];
const LEADER_LINE_HEIGHT = 46 * 1.5;

// For achievement
const GOLD_MEDAL_LAP_COUNT = 100;
const SILVER_MEDAL_LAP_COUNT = 50;
const BRONZE_MEDAL_LAP_COUNT = 20;
const NO_MEDAL_BG = 'linear-gradient(-45deg, #b721ff 0%, #21d4fd 100%)';
const BRONZE_MEDAL_BG = 'linear-gradient(-45deg, #c79081 0%, #dfa579 100%)';
const SILVER_MEDAL_BG = 'linear-gradient(to left, #BDBBBE 0%, #9D9EA3 100%)';
// const GOLD_MEDAL_BG = 'linear-gradient(-45deg, #e6b980 0%, #eacda3 100%)'
const GOLD_MEDAL_BG = 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)';
const ACHIEVEMENT_SET_STAT_TIMEOUT = 4000; // in milliseconds
const ACHIEVEMENT_CONFETTI_TIMEOUT = 30000; // in milliseconds
const ACHIEVEMENT_PAGE_TIMEOUT = 40000; // in milliseconds

$(document).ready(() => {
    $('#year').text(new Date().getFullYear());
});
