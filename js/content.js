import { score, packScore } from './config.js';
import { round, sortPacks } from './util.js';

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
    const flagResult = await fetch(`${dir}/_flags.json`);
    try {
        const list = await listResult.json();
        const flags = await flagResult.json();
        let packsMap = []
        try {
            packsMap = await packResult.json();
        } catch (e) {
            // pack error object [0] will always be "err"
            // [1] is the error message
            // (optional) [2] is the level name being processed while the error is thrown
            packsMap = ["err", e] 
        }

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

                    try {
                        if (level.records) {
                            // for each record, look up "user" in the flag map and add flag property to their record
                            level.records.forEach((record) => {
                                record.flag = flags[record.user];
                            });

                        }
                    } catch (e) {
                        console.error(`failed to process flags: ${e}`)
                    }
                    
                    try {
                        if (packsMap[0] !== "err") {
                            packsMap.forEach((pack) => {
                                try {
                                    if (pack.levels) { 
                                        if (pack.levels.includes(path)) {
                                            packs.push(pack);
                                            
                                        }

                                        // checks if the pack contains the level's path
                                        for (let packlevel in pack.levels) { 
                                            if (pack.levels[packlevel] === path) {
                                                // iterate through every level in the pack,
                                                // and overwrite the level path in the levels array
                                                // with the object it resolves to
                                                pack.levels[packlevel] = level;
                                                pack.levels[packlevel].path = path;
                                                pack.levels[packlevel].rank = rank;
                                                
                                            }
                                        }
                                    } else if (pack.difficulty === level.difficulty) {
                                        packs.push(pack);
                                    }
                                } catch (e) {
                                    console.error(`failed to fetch pack ${pack.name}:  ${e}`)
                                    packs.push(["err", e, pack.name])
                                }
                            })
                        } else {
                            console.error(`failed to process packs: ${packsMap[1]}`)
                        }
                    } catch (e) {
                        console.error(`failed to fetch packs: ${e}`)
                        packs.push(["err", e])
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

export async function fetchLeaderboard(list) {
    const packs = await fetchPacks(list);
    const flagResult = await fetch(`${dir}/_flags.json`);
    const flags = await flagResult.json()

    const scoreMap = {};
    const errs = [];
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
                flag: flags[person]
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
            flag: flags[level.verifier]
        };
        completedPacksMap[verifier] ??= new Set();

        // check if user has verified/completed all levels in a pack (prevents case of pack not being awarded if a player verified the first level in a pack but completed one of the other levels)
        if (level.packs.length > 0) {
            level.packs.forEach((pack) => {
                if (Array.isArray(pack.levels)) {
                    const allVerified = pack.levels.every((packLevel) =>
                        list.some(([_, __, lvl]) =>
                            (lvl.path == packLevel.path) &&
                            (lvl.records.some((r) => r.user.toLowerCase() === verifier.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === verifier.toLowerCase()))
                        )
                    );
                    if (allVerified) {
                        completedPacksMap[verifier].add(pack);
                    }
                } else if (level.difficulty >= 7) {
                    // Count levels completed by the user for the legendary pack
                    const completedInDifficulty = list.filter(([_, __, lvl]) =>
                        (lvl.difficulty >= 7) && 
                        (lvl.records.some((r) => r.user.toLowerCase() === verifier.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === verifier.toLowerCase())) &&
                        packs.some((otherPack) => otherPack.levels && !otherPack.levels.some((otherLevel) => otherLevel.path === lvl.path))
                    ).length;

                    // Check if the user has completed as many levels as the pack's threshold
                    if (completedInDifficulty >= 5) {
                        completedPacksMap[verifier].add(pack);
                    }
                } else if (pack.difficulty === level.difficulty) {
                    // Count levels completed by the user for the other difficulty packs
                    const completedInDifficulty = list.filter(([_, __, lvl]) =>
                        (lvl.difficulty === level.difficulty) && 
                        (lvl.records.some((r) => r.user.toLowerCase() === verifier.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === verifier.toLowerCase())) &&
                        packs.some((otherPack) => otherPack.levels && !otherPack.levels.some((otherLevel) => otherLevel.path === lvl.path))
                    ).length;

                    // Check if the user has completed as many levels as the pack's threshold
                    if (completedInDifficulty >= 5) {
                        completedPacksMap[verifier].add(pack);
                    }
                }
            })
        }

        const { verified } = scoreMap[verifier];
        verified.push({
            rank,
            level: level.name,
            score: score(rank, level.difficulty, 100, level.percentToQualify, list),
            link: level.verification,
        });



        
        
        // fake completed levels object, 
        // used to show verifications under the "completed" section
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
                userPacks: [],
                flag: record.flag,
            };
            
            completedPacksMap[user] ??= new Set();

            const { completed, progressed } = scoreMap[user];

            let progressedScore = 0;
            let completedScore = 0;

            if (record.percent === 100) {

                completedScore += score(rank, level.difficulty, 100, level.percentToQualify, list);
                

                // check if user has completed/verified all levels in a pack (prevents case of pack not being awarded if a player completed the first level in a pack but verified one of the other levels)
                if (level.packs.length > 0) {
                    level.packs.forEach((pack) => {
                        if (Array.isArray(pack.levels)) {
                            
                            const allCompleted = pack.levels.every((packLevel) =>
                                list.some(([_, __, lvl]) =>
                                    (lvl.path == packLevel.path) &&
                                    (lvl.records.some((r) => r.user.toLowerCase() === user.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === user.toLowerCase()))
                                )
                            );
                            if (allCompleted) {
                                completedPacksMap[user].add(pack);
                            }
                        } else if (level.difficulty >= 7) {
                            // Count levels completed by the user for the legendary pack
                            const completedInDifficulty = list.filter(([_, __, lvl]) =>
                                (lvl.difficulty >= 7) && 
                                (lvl.records.some((r) => r.user.toLowerCase() === user.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === user.toLowerCase())) &&
                                packs.some((otherPack) => otherPack.levels && !otherPack.levels.some((otherLevel) => otherLevel.path === lvl.path))
                            ).length;

                            // Check if the user has completed as many levels as the pack's threshold
                            if (completedInDifficulty >= 5) {
                                completedPacksMap[user].add(pack);
                            } 
                        } else if (pack.difficulty === level.difficulty) {
                            // Count levels completed by the user for the other difficulty packs
                            const completedInDifficulty = list.filter(([_, __, lvl]) =>
                                (lvl.difficulty === level.difficulty) && 
                                (lvl.records.some((r) => r.user.toLowerCase() === user.toLowerCase() && r.percent === 100) || (lvl.verifier.toLowerCase() === user.toLowerCase())) &&
                                packs.some((otherPack) => otherPack.levels && !otherPack.levels.some((otherLevel) => otherLevel.path === lvl.path))
                            ).length;

                            // Check if the user has completed as many levels as the pack's threshold
                            if (completedInDifficulty >= 5) {
                                completedPacksMap[user].add(pack);
                            }
                        }
                    });
                }
                completed.push({
                    rank,
                    level: level.name,
                    score: completedScore,
                    link: record.link,
                    mobile: record.mobile,
                    rating: record.enjoyment,
                });
                

                return;
            }
            
            progressedScore += score(rank, level.difficulty, record.percent, level.percentToQualify, list)
            progressed.push({

                rank,
                level: level.name,
                percent: record.percent,
                score: progressedScore,
                link: record.link,
                mobile: record.mobile,
                rating: record.enjoyment,
            });

            

            
        });

        possibleMax += score(rank, level.difficulty, 100, level.percentToQualify, list);
    })


    packs.forEach((pack) => possibleMax += packScore(pack, list));

    Object.entries(completedPacksMap).forEach(([user, packs]) => {
        const uniquePacks = Array.from(packs);
        sortPacks(uniquePacks)
        
        scoreMap[user].userPacks.push(...uniquePacks);
    });
    
    // Wrap in extra Object containing the user and total score

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { created, verified, completed, progressed, flag} = scores;


        let total = [completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        scores.userPacks.forEach((pack) => { 
            total += packScore(pack, list)
            pack['score'] = packScore(pack, list)
        }) 

        return {
            user,
            flag, 
            total: round(total),
            possibleMax,
            userPacks: scores.userPacks,
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
    
}

export async function fetchPacks(list) {
    try {
        const packResult = await fetch(`${dir}/_packs.json`);
        let packs = []
        try {
            packs = await packResult.json();
        } catch (e) {
            console.error(`failed to process packs: ${e}`)
            packs = ["err", e]
        }
        let users = [];

        list.forEach((object) => {
            // list is an array > array with length of 3 > null unless something is broken, level rank, level object
            let level = object[2];

            if (level.records) {
                const newUsers = level.records.find(
                    (record) => !users.includes(record.user)
                );
                if (newUsers) users.push(newUsers);
            }

            packs.forEach(async (pack) => {
                // initially build the packs
                try {
                    pack["records"] = [];
                    if (pack.levels) {
                        // checks if the pack contains the level's path
                        for (let packlevel in pack.levels) {
                            if (pack.levels[packlevel] === level.path) {
                                // iterate through every level in the pack,
                                // and overwrite the level path in the levels array
                                // with the object it resolves to
                                pack.levels[packlevel] = level;

                                // while we're here, make a list of all the users connected
                                // to packs (records, verifier)
                                if (
                                    !users.includes(pack.levels[packlevel].verifier)
                                )
                                    users.push(pack.levels[packlevel].verifier);

                                pack.levels[packlevel].path = level.path;
                                pack.levels[packlevel].rank = level.rank;
                            }
                            pack.levels.sort((a, b) => a.rank - b.rank)
                        }
                    }
                } catch (e) {
                    console.error(`failed to fetch pack ${pack.name}:  ${e}`);
                }
            });
        });

        let tempRecords = {};

        users.forEach((user) => {
            let userLower = user.user
                ? user.user.toLowerCase()
                : user.toLowerCase(); // normalized user for comparison
            packs.forEach(async (pack) => {
                // Initialize tempRecords[pack.name] as a Set if not already done
                if (!tempRecords[pack.name]) tempRecords[pack.name] = new Set();

                if (pack.levels) {
                    // Check if user has completed all levels in the pack
                    const allCompleted = pack.levels.every((packLevel) =>
                        list.some(([_, __, lvl]) =>
                            (lvl.path == packLevel.path) &&
                            (lvl.records.some((r) => r.user.toLowerCase() === userLower && r.percent === 100) || (lvl.verifier.toLowerCase() === userLower))
                        )
                    );

                    if (allCompleted && !tempRecords[pack.name].has(userLower)) {
                        tempRecords[pack.name].add(userLower);
                    }

                } else if (pack.difficulty >= 7) {
                    // Count levels completed by the user for the legendary pack
                    const completedInDifficulty = list.filter(([_, __, lvl]) =>
                        (lvl.difficulty >= 7) && 
                        (lvl.records.some((r) => r.user.toLowerCase() === userLower && r.percent === 100) || (lvl.verifier.toLowerCase() === userLower)) &&
                        packs.some((otherPack) => otherPack.levels && !otherPack.levels.some((otherLevel) => otherLevel.path === lvl.path))
                    ).length;

                    // Check if the user has completed as many levels as the pack's threshold
                    if (completedInDifficulty >= 5 && !tempRecords[pack.name].has(userLower)) {
                        tempRecords[pack.name].add(userLower);
                    }
                } else {
                    // Check levels by difficulty
                    let levelsInDifficulty = list.filter(
                        ([_, __, lvl]) =>
                            lvl.difficulty === pack.difficulty && lvl.id !== 0
                    );
                    const completedLevels = levelsInDifficulty.filter(
                        ([_, __, level]) =>
                            level.records.some(
                                (record) =>
                                    record.user.toLowerCase() === userLower &&
                                    record.percent === 100
                            )
                    );

                    if (
                        completedLevels.length >= 5 &&
                        !tempRecords[pack.name].has(userLower)
                    ) {
                        tempRecords[pack.name].add(userLower);
                    }
                }

                tempRecords[pack.name].forEach((uniqueUser) => {
                    // Find the original user object from `users` array
                    const originalUser = users.find(
                        (u) => (u.user || u).toLowerCase() === uniqueUser
                    );

                    // Determine the correct value to push: either user.user or user itself
                    const userToPush = originalUser.user
                        ? originalUser.user
                        : originalUser;

                    if (!pack.records.includes(userToPush)) {
                        pack.records.push(userToPush);
                    }
                });
            });
        });

        sortPacks(packs);
        
        return packs;
    } catch (e) {
        console.error(`failed to fetch packs: ${e}`)
        return ["err", e]
    }
}

export async function fetchStaff() {
    try {
        const staffResults = await fetch(`${dir}/_staff.json`);
        const staff = await staffResults.json();

        // add link to editor if there isn't one
        for (const editor of staff) {
            if (!editor.link)
                editor.link = "https://laylist.pages.dev/#/leaderboard/user/" +
                    editor.name.toLowerCase().replaceAll(" ", "_");
        }
        return staff;
    } catch (e) {
        console.error(`failed to fetch staff: ${e}`)
        return null;
    }
}

export function averageEnjoyment(records) {
    if (!records || records.length === 0) return "?"; // handle empty records

    let validRecordsCount = 0;
    const total = records.reduce((sum, record) => {
        if (!isNaN(record.enjoyment) && record.percent === 100) {
            validRecordsCount++;
            return sum + parseFloat(record.enjoyment);
        }
        return sum;
    }, 0);

    if (validRecordsCount === 0) return "?"; // handle case with no valid enjoyment values

    const average = total / validRecordsCount;
    const result = round(average, 3)
    if (isNaN(result) || result === null) {
        return "?";
    }
    return result;
}

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

export function fetchHighestEnjoyment(list, difficulty) {
    let endEnjoyment = 0 
    let maxLevel;
    list.forEach(([err, rank, level]) => {
        if (err) {
            return;
        }
        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            const enjoyment = averageEnjoyment(level.records);
            if (enjoyment > endEnjoyment) {
                endEnjoyment = enjoyment;
                maxLevel = level;
            }
        }
    });

    if (!maxLevel) return null;

    return ` ${endEnjoyment}/10 (${maxLevel.name})`;

}

export function fetchLowestEnjoyment(list, difficulty) {
    let endEnjoyment = 100
    let minLevel;
    list.forEach(([err, rank, level]) => {
        if (err) {
            return;
        }
        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            const enjoyment = averageEnjoyment(level.records);
            if (enjoyment < endEnjoyment) {
                minLevel = level;
                endEnjoyment = enjoyment;
            }
        }
    });

    if (!minLevel) return null;

    return ` ${endEnjoyment}/10 (${minLevel.name})`;

}

export function fetchTotalScore(list, difficulty) {

    let totalScore = 0
    
    list.forEach(([err, rank, level]) => {
        if (err) {
            return;
        }
        if (rank === null) {
            return;
        }

        if (level.difficulty === difficulty) {
            totalScore += score(level.rank, difficulty, 100, 100, list)
        }

    })

    return round(totalScore);

}

export async function fetchUsers() {
    const users = new Set();
    const list = await fetchList();

    list.forEach(([err, rank, level]) => {
        users.add(level.verifier.trim())
        for (const creator of level.creators) {
            users.add(creator.trim())
        }
        for (const record of level.records) {
            users.add(record.user.trim())
        }
    })
    
    const userArray = Array.from(users)

    const uniqueUsers = Array.from(new Set(userArray.map(user => user.toLowerCase())));

    return uniqueUsers
}
