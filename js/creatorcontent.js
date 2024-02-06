import { cscore } from './score.js';
import { fetchList } from '../content.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';
/**
 * Symbol, that marks a level as not part of the list
 */

export async function fetchCLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];

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

        // Solos
        const creator = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.creators.toLowerCase(),
        ) || level.creators;
        scoreMap[creator] ??= {
            solos: [],
            levelsHosted: [],
            collabParts: [],
        };
        const { solos } = scoreMap[creator];
        solos.push({
            rank,
            level: level.name,
            score: score(level.difficulty, 100, level.percentToQualify),
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
                    score: score(level.difficulty, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank,
                level: level.name,
                percent: record.percent,
                score: score(level.difficulty, record.percent, level.percentToQualify),
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
