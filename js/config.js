import { round } from './util.js';
import { fetchTierLength, fetchTierMinimum } from "./content.js";

// ------------------------------------------------------------------------------------------
// Welcome to the site's configuration! This file allows us to change: 
//      - The formula used anytime the site needs to calculate a score (level, record, and
          // pack scores)
//      - The colors a pack is displayed as
//      - The amount of decimals the site will globally round to and display
// Additionally, notes have been provided to explain exactly what everything does, especially
// to non programmers. Notes are denoted using "//", as seen here.
// ------------------------------------------------------------------------------------------

export const scale = 1; // Amount of decimals the site will globally round to and display.

// ------------------------------------------------------------------------------------------
// Information about imported functions:
//      - round takes in a number and rounds it to the nearest nth decimal, where n is the
//        number of decimals the site will globally round to.
//      - fetchTierLength takes in the list data and a specific difficulty, then outputs the
//        amount of levels in that difficulty.
//      - fetchTierMinimum takes in the list data and a specific difficulty, then outputs
//        the level in that difficulty with the GREATEST rank (lowest-placed on the list).
// ------------------------------------------------------------------------------------------


// -------------------------------------
// Score function (levels and records):
// -------------------------------------
export function score(rank, difficulty, percent, minPercent, list) {
    // There are two formulas used to calculate a level/record's score: linear and exponential.
    //      - Linear: Used for the levels in the beginner through mythical tiers, where each
    //        level increments an equal value from the minimum point value in the tier to
    //        the maximum point value in the tier.
    //      - Exponential: Used for the extreme and above tiers, where each level increments
    //        an increasingly large value from the minimum point value of the supreme tier
    //        to the point value of the #1 ranked level.

    // EXPONENTIAL FUNCTION CONFIGURATION
    // Change these values to edit the exponential function.
    const maxExpScore = 750; // The maximum score given by the exponential function.
    const minExpScore = 131; // The minimum score given by the exponential function.
    const scoreDivider = 130 // The maximum score given by the linear function.
    const curveBuff = 0.4; // Increase this value to steepen the curve of the exponential
                           // function (must be greater than 0).
    const diffDivider = 6; // The difficulty (exclusive) at which the site will stop using
                           // the linear point system and start using the exponential one.
    // NOTE: If you change the value of diffDivider without adding/removing cases in the
    // switch statement below, it'll mess stuff up.

    // Initializes variables used in the function
    let score = 0;
    let minScore = 0;
    let maxScore = 0;
    const tierLength = fetchTierLength(list, difficulty);
    const tierMin = fetchTierMinimum(list, difficulty);
    const rankInTier = rank - tierMin + tierLength;
    
    if (difficulty < diffDivider) { // Checks if the difficulty tier is mythical and below
        // LINEAR FUNCTION CONFIGURATION
        // You can change the minimum and maximum point values given for each tier here.

        // A switch statement basically just tests a bunch of values against the value of
        // the case (in this case, the value of difficulty). Read the comments in the
        // function below for more clarification.
        switch (difficulty) { // Set the values of minScore and maxScore based on the difficulty.
            case 0: // If the value of difficulty is 0, do the following:

                /* Beginner Tier */
                minScore = 3;
                maxScore = 7;
                break; // Leave the switch statement without checking any other cases.
            case 1: // If the value of difficulty is 1, do the following:

                /* Easy Tier */
                minScore = 7.1;
                maxScore = 13;
                break;
            case 2: // etc.

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
            default: // If none of the other cases are met, resort to this:

                /* If there's a mistake */
                break;
        }

        // Calculates the linear score
        let decreaseAmount = (maxScore - minScore) / (tierLength - 1);
        score = maxScore - decreaseAmount * (rankInTier - 1);
        if (tierLength === 1) {     
            score = maxScore;
        }
    } // End of linear portion
    
    else { // Executes this code if the previous condition wasn't true (in other words, if
           // the difficulty tier is extreme or above).
        
        let expLength = fetchTierMinimum(list, diffDivider); // Gets the number of levels
        // from the tier above diffDivider to the #1 ranked level.
        
        const scaleFactor = Math.log(minExpScore / maxExpScore); // Gets the scale factor
        // for the exponential function.
        
        // Calculates the exponential score
        let expScore = maxExpScore * Math.exp(scaleFactor * Math.pow((rank - 1) / (expLength - 1), curveBuff));
        
        // Rounds up the value of expScore to minExpScore if it's below the value of
        // minExpScore, and rounds down the value of expScore to maxExpScore if it's above
        // the value of maxExpScore.
        score = Math.max(minExpScore, Math.min(expScore, maxExpScore)); 
    } // End of exponential portion
    
    // Set minPercent to 100 if the difficulty tier is hard tier or below
    if (difficulty < 4) {
        minPercent = 100;
    }
    
    // Multuplies the value of score by the factor of the difference between the value of
    // percent and minPercent - 1, divided by the difference between 100 and the value of
    // minPercent - 1 (note that if you c)
    score *=((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    // Rounds the value of score to the nearest nth decimal, where n is the value of scale,
    // and makes it 0 if the score is negative.
    score = Math.max(round(score), 0);

    return score;
}

// ------------------------
// Score function (packs):
// ------------------------
export function packScore(pack) {
    let packscore = 0; // Initialize packscore

    // Code between the '/*' and '*/' symbols is ignored / disabled.
    // This code used to score packs based on the levels they contain, if any.

    /* if (pack.levels) { // Checks if the pack has definitive levels associated with it

        // Sets packscore to the average of the scores of the levels in the pack
        let totalScore = 0
        pack.levels.forEach((lvl) => {
            totalScore += score(lvl.rank, lvl.difficulty, 100, lvl.percentToQualify, list)
        })
        packscore = totalScore / pack.levels.length
    } 

    else { // If the pack does not have definitive levels associated with it (if it is
           // a difficulty pack) */

        // For help figuring out how this switch statement works, look at the comments on
        // the switch statement in the score function above.
        switch (pack.difficulty) { // Set the pack's score based on its difficulty.
            case 0:

                /* Beginner Packs */
                packscore = 5;
                break;
            case 1:

                /* Easy Packs */
                packscore = 15;
                break;
            case 2:

                /* Medium Packs */
                packscore = 30;
                break;
            case 3:

                /* Hard Packs */
                packscore = 50;
                break;
            case 4:

                /* Insane Packs */
                packscore = 70;
                break;
            case 5:

                /* Mythical Packs */
                packscore = 100;
                break;
            case 6:

                /* Extreme Packs */
                packscore = 150;
                break;
            case 7:

                /* Legendary Packs */
                packscore = 200;
                break;
            default:

                /* if the pack's difficulty does not correspond to a "case" above */
                packscore = null;
                break;
        }
 // } Ignore this bracket, it is part of the commented out code above.

    // if the packscore is not "null" (i.e. if the difficulty is not in 
    // the above switch statement), round before returning it.
    return packscore === null ? packscore : round(packscore);
}

// ------------------------
// Dark mode pack colors:
// ------------------------
export function packColor(difficulty) {
    // NOTE: The site uses rgba values for the colors of packs.
    //      - r is the red content of the color.
    //      - g is the green content of the color.
    //      - b is the blue content of the color.
    //      - a is the alpha/opacity of the color (think alpha trigger in Geometry Dash).
    //      - The values of r, g, and b are integers between 0 and 255, inclusive.
    //      - The value of a is a number between 0 and 1, inclusive.

    // If you're not on mobile, an easy way to select and test these values is to open
    // inspect element, click on a pack's button, and find something that looks like this:
    // https://imgur.com/a/6q2MsTj. From there, you're able to change the color in real
    // time (on your device only). When you're done, copy the values from above the color
    // picker and fill them into the switch statement below.

    // Also, keep in mind that these are the values used *while the pack is selected*.
    // If a pack is deselected or the user is only hovering over it, the opacity will
    // decrease.

    // Initialize r, g, b, and a values
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1; // The site assumes the opacity is 1, unless specified below.
    
    // For help figuring out how this switch statement works, look at the comments on
    // the switch statement in the score function above.
    switch (difficulty) { // Set the pack's color based on its difficulty.
        case 0:

            /* Beginner Packs */
            r = 197;
            g = 12;
            b = 105;
            a = 0.9;
            break;
        case 1:

            /* Easy Packs */
            r = 0;
            g = 53;
            b = 177;
            a = 0.9;
            break;
        case 2:

            /* Medium Packs */
            r = 17;
            g = 137;
            b = 54;
            a = 0.8;
            break;
        case 3:

            /* Hard Packs */
            r = 204;
            g = 209;
            a = 0.8;
            break;
        case 4:

            /* Insane Packs */
            r = 211;
            g = 99;
            a = 0.9;
            break;
        case 5:

            /* Mythical Packs */
            r = 117;
            g = 13;
            b = 209;
            a = 0.9;
            break;
        case 6:

            /* Extreme Packs */
            r = 217;
            g = 6;
            b = 6;
            a = 0.9;
            break;
        case 7:

            /* Legendary Packs */
            r = 200;
            g = 200;
            b = 200;
            a = 0.8;
            break;
        default:

            /* If there's a mistake */
            break;
    }
    return [r, g, b, a];
}
