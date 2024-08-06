import { localize } from './util.js';
import { fetchTierMinimum } from './content.js';
/**
 * Numbers of decimal digits to round to
 */
const scale = 1;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, difficulty, percent, minPercent) {
    let score = 0;
    /* const tierMin = fetchTierMinimum(difficulty); */
    let tierLength = fetchTierLength(difficulty);
    
    if (difficulty<4){
        minPercent = 100;
    }
    switch (difficulty) {
        case 0:
            /* Beginner Tier */
            score = tierLength;
            break;
        case 1:
            /* Easy Tier */
            score = 10;
            break;
        case 2:
            /* Medium Tier */
            score = 25;
            break;
        case 3:
            /* Hard Tier */
            score = 50;
            break;
        case 4:
            /* Insane Tier */
            score = 75;
            break;
        case 5:
            /* Mythical Tier */
            score = 100;
            break;
        case 6:
            /* Extreme Tier */
            score = 150;
            break;
        case 7:
            /* Legendary Tier */
            score = 200;
            break;
        case 8:
            /* Impossible Tier */
            score = 250;
            break;
        case 9:
            score = 350;
            break;
        case 10:
            score = 500;
            break;
        default:
            score = 0;
            break;
    }
    /* switch (difficulty) {
        case 0:
            /* Beginner Tier *
            score = 1 + (4 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 1:
            /* Easy Tier *
            score = 6 + (4 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 2:
            /* Medium Tier *
            score = 11 + (9 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 3:
            /* Hard Tier *
            score = 21 + (19 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 4:
            /* Insane Tier *
            score = 41 + (29 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 5:
            /* Mythical Tier *
            score = 71 + (29 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 6:
            /* Extreme Tier *
            score = 101 + (99 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 7:
            /* Legendary Tier *
            score = 201 + (199 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 8:
            /* Impossible Tier *
            score = 401 + (349 * ((tierMin - (rank - 1)) / tierLength));
            break;
        case 9:
            score = 350;
            break;
        case 10:
            score = 500;
            break;
        default:
            score = 0;
            break;
    } */
    score*=((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    score = Math.max(0, score);
    if (percent != 100) {
        return round(score - score / 3);
    }

    return round(score);
}

export function challengeScore(difficulty) {
    let score = 0;
    
    switch (difficulty) {
        case 0:
            score = 5;
            break;
        case 1:
            score = 10;
            break;
        case 2:
            score = 25;
            break;
        case 3:
            score = 50;
            break;
        case 4:
            score = 75;
            break;
        case 5:
            score = 100;
            break;
        case 6:
            score = 150;
            break;
        case 7:
            score = 200;
            break;
        case 8:
            score = 250;
            break;
        case 9:
            score = 350;
            break;
        case 10:
            score = 500;
            break;
        case 11:
            score = 1000;
            break;
        default:
            score = 0;
            break;
    }

    return score;
}

export function cscore(contributorrole) {
    let cscore = 0;
    switch (contributorrole) {
        // solos under 1 minute
        case 0:
            cscore = 75;
            break;
        // solos under 2 minutes
        case 1:
            cscore = 100;
            break;
        // solos under 3 minutes
        case 2:
            cscore = 125;
            break;
       // solos under 5 minutes
        case 3:
            cscore = 150;
            break;
        // solos over 5 minutes
        case 4:
            cscore = 200;
            break;
        // collab parts under 30 seconds
        case 5:
            cscore = 25;
            break;
        // collab parts under 1 minute
        case 6:
            cscore = 50;
            break;
        // collab parts over 1 minute
        case 7:
            cscore = 100;
            break;
        // collab host
        case 8:
            cscore = 50;
            break;
    }
    
    return cscore;
}

/*export function avgEnjoyment(records) {
    let count = 0;
    for (let i = 0; i < level.records.length(); i++) {
            count += level.records[i].enjoyment;
        }
    }
    return (count / level.records.length());
}*/

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}

export function fetchTierLength(difficulty) {
    let a = difficulty;
    return a;
}
