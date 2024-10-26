import { round } from './util.js';
import { fetchList } from './content.js'

// ------------------------------------------------------------------
// welcome to the site's configuration!
// this file allows us to change: 
//      - the formula used anytime the site needs to display a score
//      - the colors a pack is displayed as
//      - the amount of decimals the site will display globally
//      - legacy challenge list functions

// additionally, notes have been provided to explain exactly what
// everything does, especially to non programmers.
// notes are denoted using "//", seen here.
// ------------------------------------------------------------------


export const scale = 1; // amount of decimals the site will globally round to


// fetchTierLength() takes in the list data and a specific difficulty, then
// outputs the amount of levels in that difficulty

// fetchTierMinimum takes in the list data and a specific difficulty, then
// outputs the level in that difficulty with the GREATEST rank 


// ---------------
// Score function:
// ---------------

import { fetchTierLength, fetchTierMinimum } from "./content.js";

export function score(rank, difficulty, percent, minPercent, list) {

    // there are two formulas used to calculate a level's score: linear and exponential.


    // EXPONENTIAL FUNCTION CONFIG
    // change these values to edit the exponential function!
    
    const maxExpScore = 750; // max score cap, should be the score for the #1 ranked level
    const scoreDivider = 130 // the highest score calculated using the linear function.
    const curveBuff = 0.4; // increase this value to increase the curve of the exponential function i think maybe, shoukd be greater than 0
    const expOffset = 0; // increase this value to offset entire exponential function scores. cannot be negative.
    const diffDivider = 6; // the difficulty (exclusive) at which the site will stop using a linear point system and start using the exponential one.
                           // remember, if you increase this value without adding cases for the new difficulty, all scores not covered will be 0!
    
    const minExpScore = 131; // minimum score cap for exponential function, the level with a rank equal to the value of the expLength variable will get this score

 




    let score = 0;
    let minScore = 0;
    let maxScore = 0;
    const tierLength = fetchTierLength(list, difficulty);
    const tierMin = fetchTierMinimum(list, difficulty);
    const rankInTier = rank - tierMin + tierLength;
    
    if (difficulty < 4) {
        minPercent = 100;
    }
    
    // mythical and below
    if (difficulty < diffDivider) {
        // LINEAR FUNCTION CONFIG
        // you can change the minimum and maximum values for each tier here!


        // you can think of switch + case like:

        switch (difficulty) { // check the difficulty

            case 0: // if the difficulty is 0, set the values to this:

                /* Beginner Tier */
                minScore = 3;
                maxScore = 7;
                break;
            case 1: // etc

                /* Easy Tier */
                minScore = 7.1;
                maxScore = 13;
                break;
            case 2:
                /* Medium Tier */
                minScore = 13.1;
                maxScore = 37;
                break;
            case 3:
                /* Hard Tier */
                minScore = 37.1;
                maxScore = 63;
                break;
            case 4:
                /* Insane Tier */
                minScore = 63.1;
                maxScore = 87;
                break;
            case 5:
                /* Mythical Tier */
                minScore = 87.1;
                maxScore = scoreDivider;
                break;
        }

    
        let decreaseAmount = (maxScore - minScore) / (tierLength - 1);

        score = maxScore - decreaseAmount * (rankInTier - 1);

        if (tierLength === 1) {
                     
            score = maxScore;
        }

    } else { // extremes and above, exponential
        
        let expLength = fetchTierMinimum(list, diffDivider);
        
        const rankRange = expLength - 1; // calc range
        const scaleFactor = Math.log(minExpScore / maxExpScore);
        
        let expScore = maxExpScore * Math.exp(scaleFactor * Math.pow((rank - 1) / rankRange, curveBuff));
        
        expScore += expOffset;
        
        score = Math.max(minExpScore, Math.min(expScore, maxExpScore));
    }
    
    
    score*=((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    
    score = round(score);

    return score;
}

// ----------------------------------
// Score function (difficulty packs):
// ----------------------------------

export function packScore(pack, list) { // the score assigned to difficulty packs.
    let packscore = 0;

    if (pack.levels) {
        let totalScore = 0
        pack.levels.forEach((lvl) => {
            console.log(score(lvl.rank, lvl.difficulty, 100, lvl.percentToQualify, list))
            console.log(lvl.name)
            totalScore += score(lvl.rank, lvl.difficulty, 100, lvl.percentToQualify, list)
            
            packscore = totalScore / pack.levels.length
            
        })
    } else {
    
        switch (pack.difficulty) { 
            case 0: // if the difficulty is 1, set the score to this:
                packscore = 5;
                break;
            case 1:
                packscore = 15;
                break;
            case 2:
                packscore = 30;
                break;
            case 3:
                packscore = 50;
                break;
            case 4:
                packscore = 70;
                break;
            case 5:
                packscore = 100;
                break;
            case 6:
                packscore = 150;
                break;
            default:
                packscore = 0;
                break;
        }
        
    }
    return packscore;
}



// ------------
// Pack colors:
// ------------

export function lightPackColor(difficulty) { // colors the packs will display as, while the site is on dark mode.

    // the site uses rgba values for the colors of packs.
    // "a" in rgba is the opacity of the color.

    // if you're not on mobile (zach....) an easy way to select and test these values is to
    // open inspect element > click on the pack's button > find something that looks like this:
    // https://imgur.com/a/6q2MsTj
    // from there, you're able to change the color in real time (on your device only)
    // when you're done, copy the values from above the color picker and 
    // fill them into the "switch" statement below.

    // also keep in mind that these are the values used *while the pack is selected*.
    // if a pack is deselected or the user is hovering over it, the opacity will decrease.

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1; // the site assumes the opacity is 1, unless specified below
    
    switch (difficulty) { // check the pack's difficulty
        case 0: // if it is 0, set the rgba values to these:
            r = 52;
            g = 107;
            b = 235;
            a = 0.9;
            break;
        case 1:
            r = 19;
            g = 204;
            b = 232;
            break;
        case 2:
            r = 52;
            g = 150;
            b = 82;
            break;
        case 3:
            r = 184;
            g = 199;
            b = 13;
            break;
        case 4:
            r = 13;
            b = 255;
            a = 0.8;
            break;
        case 5:
            r = 130;
            g = 62;
            b = 206;
            a = 0.7;
            break;
        case 6:
            r = 255;
            break;
        default:
            break;
    }
    return [r, g, b, a];
}

export function darkPackColor(difficulty) { // colors the packs will display as, while the site is on dark mode.

    // the site uses rgba values for the colors of packs.
    // "a" in rgba is the opacity of the color.

    // if you're not on mobile (zach....) an easy way to select and test these values is to
    // open inspect element > click on the pack's button > find something that looks like this:
    // https://imgur.com/a/6q2MsTj
    // from there, you're able to change the color in real time (on your device only)
    // when you're done, copy the values from above the color picker and 
    // fill them into the "switch" statement below.

    // also keep in mind that these are the values used *while the pack is selected*.
    // if a pack is deselected or the user is hovering over it, the opacity will decrease.


    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1; // the site assumes the opacity is 1, unless specified below
    
    switch (difficulty) { // check the pack's difficulty
        case 0: // if it is 0, set the rgba values to these:
            r = 52;
            g = 107;
            b = 235;
            a = 0.9;
            break;
        case 1: // etc
            r = 26;
            g = 194;
            b = 219;
            a = 0.8;
            break;
        case 2:
            r = 26;
            g = 97;
            b = 19;
            break;
        case 3:
            r = 209;
            g = 209;
            b = 36;
            break;
        case 4:
            r = 81;
            g = 61;
            b = 204;
            break;
        case 5:
            r = 130;
            g = 62;
            b = 206;
            break;
        case 6:
            r = 167;
            g = 37;
            b = 37;
            break;
        default:
            break;
    }
    return [r, g, b, a];
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
