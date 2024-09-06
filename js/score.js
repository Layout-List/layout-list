import { localize } from './util.js';
import { fetchList } from './content.js';

const scale = 1; // amount of decimal digits the site will globally round to, unrelated to point values
const list = await fetchList();
export function score(rank, difficulty, percent, minPercent) {

    // EXPONENTIAL FUNCTION CONFIG
    // change these values to edit the exponential function!

    const maxExpScore = 1000; // max score cap, should be the score for the #1 ranked level
    const scoreDivider = 150 // the highest score calculated using the linear function, used to offset the exponential function
    const exponent = 0.7 // the exponent of the exponential function ( level rank ^ (exponent + curveBuff) )
    const curveBuff = 0 // increase this value to increase the curve of the exponential function i think maybe
    const expOffset = 0 // increase this value to offset entire exponential function scores. cannot be negative.




    let score = 0;
    let minScore = 0;
    let maxScore = 0;
    const tierLength = fetchTierLength(difficulty);
    const tierMin = fetchTierMinimum(difficulty);
    const rankInTier = rank - tierMin + tierLength;
    
    if (difficulty < 4) {
        minPercent = 100;
    }
    
    // mythical and below
    if (difficulty < 6) {
        // LINEAR FUNCTION CONFIG
        // you can change the minimum and maximum values for each tier here!
        switch (difficulty) {
        case 0:
            /* Beginner Tier */
            minScore = 5;
            maxScore = 10;
            break;
        case 1:
            /* Easy Tier */
            minScore = 11;
            maxScore = 25;
            break;
        case 2:
            /* Medium Tier */
            minScore = 26;
            maxScore = 50;
            break;
        case 3:
            /* Hard Tier */
            minScore = 51;
            maxScore = 75;
            break;
        case 4:
            /* Insane Tier */
            minScore = 76;
            maxScore = 100;
            break;
        case 5:
            /* Mythical Tier */
            minScore = 101;
            maxScore = scoreDivider;
            break;
        }

    
        let decreaseAmount = (maxScore - minScore) / (tierLength - 1);

        score = maxScore - decreaseAmount * (rankInTier - 1);

        if (tierLength === 1) {
            score = maxScore;
        }

    } else { // extremes and above, exponential
        
        const minExpScore = scoreDivider + 1;

        score = Math.min(maxExpScore, (expOffset + // offset and cap score
        (minExpScore + (maxExpScore - minExpScore)
        / Math.pow(rank, (exponent + curveBuff)))));

    }


    score = score * (percent / 100);
    
    score = round(score);
    
    if (percent != 100) {
        
        return score - score / 3;
    }

    return score;
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

export function fetchTierMinimum(difficulty) {
    let tierMin = 0;
    list.forEach(([err, rank, level]) => {
        if (err) {
            errs.push(err);
            return;
        }

        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            tierMin = Math.max(rank, tierMin);
        }
    });
        
    console.log("tierMin: " + tierMin);
    return tierMin;
}