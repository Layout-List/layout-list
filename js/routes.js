import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Packs from './pages/Packs.js';
import ChallengeList from './Archived/ChallengeList.js';
import ChallengeLeaderboard from './Archived/ChallengeLeaderboard.js';

export default [ // Sets the browser link to access each page
    { path: '/', component: List },
    { path: '/challenges', component: ChallengeList },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/challengeleaderboard', component: ChallengeLeaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/packs', component: Packs },
];