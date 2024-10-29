import { scale } from './config.js';

// Displays n decimals after num, where n is the value of scale
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