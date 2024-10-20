import { round, score, challengeScore } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';
/**
 * Symbol, that marks a level as not part of the list
 */
const benchmarker = '_';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    const packResult = await fetch(`${dir}/_packs.json`);
    try {
        const list = await listResult.json();
        const packsMap = await packResult.json();

        // Create a lookup dictionary for ranks
        const ranksEntries = list.filter((path) => !path.startsWith(benchmarker)).map((
            path,
            index,
        ) => [path, index + 1]);
        const ranks = Object.fromEntries(ranksEntries);

        return await Promise.all(
            list.map(async (path) => {
                let packs = []
                const rank = ranks[path] || null;
                try {
                    const levelResult = await fetch(
                        `${dir}/${path.startsWith(benchmarker) ? path.substring(1) : path}.json`,
                    );
                    let level = await levelResult.json(); // no longer a constant so we can wrap in the path

                    level["path"] = path;

                    // this is mounted on top of levels, used to access packs within the level scope. 
                    // in hindsight this should have been done outside the level scope but oh well. 
                    // see fetchPacks() below for that ig.

                    // this is also really not cool but .filter() is buggy and stupid
                    try {
                        packsMap.forEach((pack) => {

                            if (pack.levels) { 
                                if (pack.levels.includes(path)) {
                                    packs.push(pack);
                                    
                                }

                                // checks if the packs contains the level's path (json file name)
                                for (let packlevel in pack.levels) { 
                                    if (pack.levels[packlevel] === path) {
                                        // iterate through every level in the pack,
                                        // and overwrite the level path in the levels array
                                        // with the object it resolves to
                                        pack.levels[packlevel] = level;
                                        pack.levels[packlevel].path = path;
                                        pack.levels[packlevel].rank = rank; // do the same for path and rank (why)

                                    }
                                }
                            } else if (pack.targetdiff === level.difficulty) {
                                console.log(pack);
                                packs.push(pack);
                                // threshold pack code idk what tto do man,,, 
                            }
                        })
                    } catch {
                        console.error("failed to fetch packs")
                    }
                    
                    
                    return [
                        null,
                        rank,
                        {
                            ...level,
                            rank,
                            path,
                            packs,
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
        console.error(`Failed to load list.`);
        return null;
    }
}

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

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchPacks(list) {
    const packResult = await fetch(`${dir}/_packs.json`);

    const packs = await packResult.json();


    
    list.forEach((object) => {

        // list is an array > array with length of 3 > usually null (probably errors if any), level rank, level object

        let level = object[2]; // why

         
        packs.forEach(async (pack) => {
            if (pack.levels) {
                for (let packlevel in pack.levels) {
                    if (pack.levels[packlevel] === level.path) {
        
                        // iterate through every level in the pack,
                        // and overwrite the level path in the levels array
                        // with the object it resolves to
        
                        pack.levels[packlevel] = level;
                        pack.levels[packlevel].path = level.path;
                        pack.levels[packlevel].rank = object[1]; // do the same for rank (why)
        
                    }
                }
            } else {
                // threshold code
            }
        })
    });
    

    
    packs.sort(
        (a, b) => b.difficulty - a.difficulty,
    );


    
    return packs;
}

export async function fetchPackRecords(packs) {
    let records = [];
    let users = []
    let completedPacksMap = {}

    

    packs.forEach((pack) => {
        pack.levels.forEach((level) =>  {
            if (level.records) {
                level.records.forEach((record) => {
                    users.push(record.user)
                })
            }
        })
    })

    
    
    users.forEach((user) => {
        completedPacksMap[user] ??= new Set();

        packs.forEach((pack) => {
            const allCompleted = pack.levels.every((packLevel) => {

                if (!packLevel.records) return;
                
                return packLevel.records.some((record) => record.user === user);
            });
            if (allCompleted) {
                completedPacksMap[user].add(pack);
            }
        })
    })

    


    return records

}

export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];
    let userPacks = [];
    let possibleMax = 0;

    const completedPacksMap = {};

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
        
        possibleMax += score(rank, level.difficulty, 100, level.percentToQualify, list);

        // Author
        const author = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.author.toLowerCase(),
        ) || level.author;
        scoreMap[author] ??= {
            created: [],
            verified: [],
            completed: [],
            progressed: [],
            userPacks: [],
        };

        completedPacksMap[author] ??= new Set();

        const { created } = scoreMap[author];
        created.push({
            rank,
            level: level.name,
            link: level.verification,
        });

        // Creators
        level.creators.forEach((person) => {
            const creator = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === person.toLowerCase(),
            ) || person;
            scoreMap[creator] ??= {
                created: [],
                verified: [],
                completed: [],
                progressed: [],
                userPacks: [],
            };
            const { created } = scoreMap[creator];
            created.push({
            rank,
            level: level.name,
            link: level.verification,
            });
        });
        
        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            created: [],
            verified: [],
            completed: [],
            progressed: [],
            userPacks: [],
        };
        completedPacksMap[verifier] ??= new Set();

        const { verified, userPacks } = scoreMap[verifier];
        verified.push({
            rank,
            level: level.name,
            score: score(rank, level.difficulty, 100, level.percentToQualify, list),
            link: level.verification,
        });

        // check if user has verified all levels in pack
        if (level.packs.length > 0) {
            level.packs.forEach((pack) => {
                if (Array.isArray(pack.levels)) {
                    const allVerified = pack.levels.every((packLevel) =>
                        list.some(([_, __, lvl]) =>
                            lvl.path == packLevel.path &&
                           lvl.verifier.toLowerCase() === verifier.toLowerCase() // check if same verifier for each lvl
                        )
                    );
                    if (allVerified) {
                        completedPacksMap[verifier].add(pack); // why
                    }
                }
            })
        }


        const { completed } = scoreMap[verifier];
        completed.push({
            rank,
            level: level.name,
            score: score(rank, level.difficulty, 100, level.percentToQualify, list),
            link: level.verification,
            rating: level.enjoyment,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                created: [],
                verified: [],
                completed: [],
                progressed: [],
                userPacks: [] 
            };
            
            completedPacksMap[user] ??= new Set();

            const { completed, progressed, userPacks } = scoreMap[user];

            if (record.percent === 100) {
                completed.push({
                    rank,
                    level: level.name,
                    score: score(rank, level.difficulty, 100, level.percentToQualify, list),
                    link: record.link,
                    rating: record.enjoyment,
                });


            // check if user has completed all levels in a pack
            if (level.packs.length > 0) {
                let completedCount = 0;
                level.packs.forEach((pack) => {
                    if (Array.isArray(pack.levels)) {
                        const allCompleted = pack.levels.every((packLevel) =>
                            list.some(([_, __, lvl]) =>
                                lvl.path == packLevel.path &&
                                lvl.records.some((r) => r.user === record.user && r.percent === 100)
                            )
                        );
                        if (allCompleted) {
                            completedPacksMap[user].add(pack);
                        }
                    } else if (pack.targetdiff === level.difficulty) {
                        // Count levels completed by the user in the current difficulty
                        const completedInDifficulty = list.filter(([_, __, lvl]) =>
                            lvl.difficulty === level.difficulty && 
                            lvl.records.some((r) => r.user === record.user && r.percent === 100) || lvl.verifier.toLowerCase() === verifier.toLowerCase()
                        )
                        .length;

                        // Check if the user has completed as many levels as the pack's threshold
                        if (completedInDifficulty >= pack.threshold) {
                            completedPacksMap[user].add(pack);
                        }
                    }
                });
            }
            return
        }
            

            progressed.push({
                rank,
                level: level.name,
                percent: record.percent,
                score: score(rank, level.difficulty, record.percent, level.percentToQualify, list),
                link: record.link,
                rating: record.enjoyment,
            });
        });
    });

    Object.entries(completedPacksMap).forEach(([user, packs]) => {
        const uniquePacks = Array.from(packs);
        scoreMap[user].userPacks.push(...uniquePacks);
    });
    
    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { created, verified, completed, progressed} = scores;
        const total = [completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            possibleMax,
            userPacks: scores.userPacks,
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
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



// no idea why we need to take in err for this but it breaks if we don't so thats cool!
export function fetchTierLength(list, difficulty) {
    let tierLength = 0;
    list.forEach(([err, rank, level]) => {
        if (err) {
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

export function fetchTierMinimum(list, difficulty) {
    let tierMin = 0;
    list.forEach(([err, rank, level]) => {
        if (err) {
            return;
        }
        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            tierMin = Math.max(rank, tierMin);
        }
    });
    
    return tierMin;
}
