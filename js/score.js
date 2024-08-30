import { localize } from './util.js';
import { fetchList } from './content.js';

/**
 * Numbers of decimal digits to round to
 */
const scale = 1;
const list = await fetchList();



/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, difficulty, percent, minPercent) {
        
        let score = 0;
        let minScore = 0;
        let maxScore = 0;
        let tierLength = fetchTierLength(difficulty);

        if (difficulty < 4) {
            minPercent = 100;
        }

        switch (difficulty) {
            case 0:
                /* Beginner Tier */
                minScore = 5;
                maxScore = 10;
                break;
            case 1:
                /* Easy Tier */
                minScore = 10;
                maxScore = 25;
                break;
            case 2:
                /* Medium Tier */
                minScore = 25;
                maxScore = 50;
                break;
            case 3:
                /* Hard Tier */
                minScore = 50;
                maxScore = 75;
                break;
            case 4:
                /* Insane Tier */
                minScore = 75;
                maxScore = 100;
                break;
            case 5:
                /* Mythical Tier */
                minScore = 100;
                maxScore = 150;
                break;
            case 6:
                /* Extreme Tier */
                minScore = 150;
                maxScore = 200;
                break;
            case 7:
                /* Supreme Tier */
                minScore = 200;
                maxScore = 250;
                break;
            case 8:
                /* Ethereal Tier */
                minScore = 250;
                maxScore = 350;
                break;
            case 9:
                /* Legendary Tier */
                minScore = 350;
                maxScore = 500;
                break;
            case 10:
                /* Silent Tier */
                minScore = 500;
                maxScore = 1000;
                break;
            case 11:
                /* Impossible Tier */
                minScore = 1000;
                maxScore = 1500;
                break;
            default:
                minScore = 0;
                maxScore = 0;
                break;
        }
        let rankFactor = (tierLength - rank) / (tierLength - 1);

        score = minScore + rankFactor * (maxScore - minScore);
        
        score = score * (percent / 100);

        score = Math.max(0, score);

        if (percent != 100) {
            return round(score - score / 3);
        }
        console.log("Tier length: " + tierLength)
        return tierLength;
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

export function averageEnjoyment(records) {
    if (!records || records.length === 0) return '?'; // handle empty records

    let validRecordsCount = 0;
    const total = records.reduce((sum, record) => {
        
        if (!isNaN(record.enjoyment) && record.percent === 100) {
            validRecordsCount++;
            return sum + parseFloat(record.enjoyment);
        }
        return sum;
    }, 0);

    if (validRecordsCount === 0) return '?'; // handle case with no valid enjoyment values

    const average = total / validRecordsCount;
    return round(average, 3);
}

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
    let tierLength = 0;
    list.forEach(([err, rank, level]) => {
        if (err) {
            errs.push(err);
            return;
        }

        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            tierLength += 1;
        }
    });

    return tierLength;
}
