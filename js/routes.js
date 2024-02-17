import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Cleaderboard from './pages/CreatorLeaderboard.js';
import Roulette from './pages/Roulette.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/creatorleaderboard', component: Cleaderboard },
    { path: '/roulette', component: Roulette },
];
