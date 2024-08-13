import List from './pages/List.js';
import ChallengeList from './pages/ChallengeList.js';
import Leaderboard from './pages/Leaderboard.js';
import ChallengeLeaderboard from './pages/ChallengeLeaderboard.js';
import CreatorLeaderboard from './pages/CreatorLeaderboard.js';
import Roulette from './pages/Roulette.js';
import Packs from './pages/Packs.js'

export default [
    { path: '/', component: List },
    { path: '/challenges', component: ChallengeList },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/challengeleaderboard', component: ChallengeLeaderboard },
    { path: '/creatorleaderboard', component: CreatorLeaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/packs', component: Packs },
];
