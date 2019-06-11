const LAP_LENGTH = 50; // in meters
const METER_UPDATE_SPAN = 400; // in milliseconds
const LEADER_COLS_WIDTH = [0, 0.08, 0.6, 0.75];
const LEADER_LINE_HEIGHT = 46 * 1.5;

const SERVER_URL = 'http://leaderboard.swim4love.com:8080';
const SWIMMER_DATA_FILE = 'stat.json';
const GOLD_MEDAL_LAP_COUNT = 100;
const SILVER_MEDAL_LAP_COUNT = 50;
const BRONZE_MEDAL_LAP_COUNT = 20;
const NO_MEDAL_BG = 'linear-gradient(-45deg, #b721ff 0%, #21d4fd 100%)';
const BRONZE_MEDAL_BG = 'linear-gradient(-45deg, #c79081 0%, #dfa579 100%)';
const SILVER_MEDAL_BG = 'linear-gradient(to left, #BDBBBE 0%, #9D9EA3 100%)';
const GOLD_MEDAL_BG = 'linear-gradient(-45deg, #e6b980 0%, #eacda3 100%)'
const CONFETTI_TIMEOUT = 2000; // in milliseconds
