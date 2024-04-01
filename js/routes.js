import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import CreatorLeaderboard from './pages/CreatorLeaderboard.js';
import Roulette from './pages/Roulette.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/creatorleaderboard', component: CreatorLeaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/fools', component: Fools },
];
