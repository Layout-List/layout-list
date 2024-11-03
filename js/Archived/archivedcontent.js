import { round } from '../util.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';
/**
 * Symbol, that marks a level as not part of the list
 */
const benchmarker = '_';

export async function fetchChallengeList() {
    const challengeListResult = await fetch(`${dir}/_challengeList.json`);
    try {
        const challengeList = await challengeListResult.json();

        // Create a lookup dictionary for ranks
        const ranksEntries = challengeList.filter((path) => !path.startsWith(benchmarker)).map((
            path,
            index,
        ) => [path, index + 1]);
        const ranks = Object.fromEntries(ranksEntries);

        return await Promise.all(
            challengeList.map(async (path) => {
                const rank = ranks[path] || null;
                try {
                    const levelResult = await fetch(
                        `${dir}/${path.startsWith(benchmarker) ? path.substring(1) : path}.json`,
                    );
                    const level = await levelResult.json();
                    return [
                        null,
                        rank,
                        {
                            ...level,
                            rank,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                    ];
                } catch {
                    console.error(`Failed to load level #${rank} ${path}.`);
                    return [path, rank, null];
                }
            }),
        );
    } catch {
        console.error(`Failed to load challenge list.`);
        return null;
    }
}

export async function fetchChallengeLeaderboard() {
    const list = await fetchChallengeList();

    const scoreMap = {};
    const errs = [];
    let possibleMax = 0;

    if (list === null) {
        return [null, ['Failed to load list.']];
    }

    list.forEach(([err, rank, level]) => {
        if (err) {
            errs.push(err);
            return;
        }

        if (rank === null) {
            return;
        }

        possibleMax += challengeScore(level.difficulty);

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank,
            level: level.name,
            score: challengeScore(level.difficulty),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank,
                    level: level.name,
                    score: challengeScore(level.difficulty),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank,
                level: level.name,
                percent: record.percent,
                score: challengeScore(level.difficulty),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            possibleMax,
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
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