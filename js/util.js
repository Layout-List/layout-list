// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 1 });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

export function rgbaBind(color) {
    try {
    // bind rgb values to rgba
    // why do i have to do it like this
    let [r, g, b, a] = color;
    // handle case where alpha isn't defined
    if (!a) {
        a = 1;
    }
    
    return `rgba(${r},${g},${b},${a})`;
    } catch (e) {
        console.error("Failed to color pack: " + e);
        return `rgba(110, 110, 110, 0.7)`
    }
}

export function opaque(color) {
    try {
        let [r, g, b, a] = color;
        // handle case where alpha isn't defined

        if (!a) {
            a = 1;
        }

        a -= 0.6;

        if (a <= 0.15) {
            a = 0.15
        }
        
        return `rgba(${r},${g},${b},${a})`;
    } catch (e) {
        console.error("Failed to color pack: " + e);
        return `rgba(110, 110, 110, 0.3)`
    }
}

