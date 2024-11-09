import { scale, maxDiff } from './config.js';
import { fetchTierMinimum, fetchTierLength } from './content.js';

// Adds comma to a number,
// for example 1000 becomes 1,000
export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: scale });
}

// Rounds the value of num to the nth decimal, where n is the value of scale
export function round(num) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = "";
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(
            Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) +
            "e-" +
            scale
        );
    }
}

// Decreases the opacity of the variable color by the value of decrease
export function rgbaBind(color, decrease) {
    let [r, g, b, a] = color;

    // Handle case where the value of a isn't defined
    if (!a) {
        a = 1;
    }

    // Sets the value of a to the value of a - decrease or 0.15, whichever is larger
    // (prevents opacities of less than 0.15)
    a = Math.max(a - decrease, 0.15);

    return `rgba(${r},${g},${b},${a})`;
}

// Gets the YouTube video's ID from the URL
// this is used to request a video's thumbnail from youtube's servers
// and embed a youtube video onto the site (verifications)
export function getYoutubeIdFromUrl(url) {
    // For more info, visit https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url.
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

// Creates an embed for the YouTube video
export function embed(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

// Gets the thumbnail of the YoutTube video to display with the embed
export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// Randomly shuffles the elements in the array passed to the function
export function shuffle(array) {
    // For more info, visit https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array.
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) { // While there remain elements to shuffle:
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // ...and swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

// Sort function for packs, sorts by difficulty and moves
// difficulty packs after other packs with the same difficulty
export function sortPacks(packs) {
    // packs with higher difficulty will display above lower
    packs.sort(
        (a, b) =>
            b.difficulty - a.difficulty);

        // push diff packs after the other packs in that tier
        packs.sort(
            (a, b) => {
                // First, check if both packs are of the same difficulty
                if (a.difficulty === b.difficulty) {
                    // If they are of the same difficulty, sort packs without levels before those with levels
                    if (!a.levels && b.levels) return 1;
                    if (a.levels && !b.levels) return -1;
                }
                // If difficulties are different, maintain their original order
                return 0;
            }
        );
}

export function selectLevel(rank, i, list) {
    // since a level's index (i) changes when we search, we need 
    // to select the level without using i.
    console.log(`rank: ${rank}`)
    console.log(`index: ${i}`)
    
        if (i === 0 && rank === null) {
            console.log('bye')
            return 0;
        } 

        // if we get here, we did not select a *divider* with index of 0
        const selectedLevel = list[rank !== null ? rank : i][2];

        console.log(`diff: ${selectedLevel.difficulty}`)
        const boost = (maxDiff - selectedLevel.difficulty)
        console.log(`boost: ${boost}`)
        if (rank !== null) {
            return rank + boost;
        } 

        // if we get here, we selected a divider
        const minimum = fetchTierMinimum(this.list, selectedLevel.difficulty);
        const length = fetchTierLength(this.list, selectedLevel.difficulty);
        
        return (minimum - length) + boost;
    }