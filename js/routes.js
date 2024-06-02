import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import CreatorLeaderboard from './pages/CreatorLeaderboard.js';
import Roulette from './pages/Roulette.js';

export default [
    { path: '/', component: List },
    /*{ path: '/challenges', component: ChallengeList },*/
    { path: '/leaderboard', component: Leaderboard },
    { path: '/creatorleaderboard', component: CreatorLeaderboard },
    { path: '/roulette', component: Roulette },
];
