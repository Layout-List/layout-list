import { localize } from './util.js';
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
export function score(difficulty, percent, minPercent) {
    let score = 0;
    
    if (difficulty<4){
        minPercent = 100;
    }
    switch (difficulty) {
        case 0:
            /* Beginner Tier */
            score = 5;
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
            /* Supreme Tier */
            score = 200;
            break;
        case 8:
            /* Ethereal Tier */
            score = 250;
            break;
        case 9:
            /* Legendary Tier */
            score = 350;
            break;
        case 10:
            /* Silent Tier */
            score = 500;
            break;
        case 11:
            /* Impossible Tier */
            score = 1000;
            break;
        default:
            score = 0;
            break;
    }
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
