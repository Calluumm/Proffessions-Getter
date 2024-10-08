const axios = require('axios');

// chat for node.js
const Chat = {
    log: (message) => {
        console.log(message);
    },
    createTextBuilder: () => {
        return {
            text: '',
            append: function (str) {
                this.text += str;
                return this;
            },
            withColor: function (r, g, b) {
                // colour later
                return this;
            },
            toString: function () {
                return this.text;
            }
        };
    }
};

// CommandManager within Node.js (i do not have minecraft installed)
const CommandManager = {
    commands: {},
    unregisterCommand: function (name) {
        delete this.commands[name];
    },
    createCommandBuilder: function (name) {
        const command = {
            name: name,
            args: [],
            executes: function (callback) {
                this.callback = callback;
                return this;
            },
            wordArg: function (argName) {
                this.args.push(argName);
                return this;
            },
            suggestMatching: function (suggestions) {
                this.suggestions = suggestions;
                return this;
            },
            register: function () {
                CommandManager.commands[this.name] = this;
            }
        };
        return command;
    },
    executeCommand: function (name, args) {
        if (this.commands[name]) {
            const command = this.commands[name];
            const e = {
                getArg: function (argName) {
                    return args[argName];
                }
            };
            command.callback(e);
        } else {
            console.log(`Command ${name} not found.`);
        }
    }
};

Chat.log("Refreshing checkProfLevels command.");

function toTitleCase(str) {
    return str.replace(/\b\w/g, function (match) {
        return match.toUpperCase();
    });
}

async function handleProfLevelsCommand(player, characterUUID) {
    try {
        let response = await axios.get(`https://api.wynncraft.com/v2/player/${player}/stats`);
        let stats = response.data;

        let character = stats.data[0].characters[characterUUID];

        if (!character) {
            let message = Chat.createTextBuilder()
                .append(`Character with UUID ${characterUUID} not found for player ${player}.`)
                .withColor(255, 0, 0);
            Chat.log(message.toString());
            return;
        }

        let professions = character.professions;

        let message = Chat.createTextBuilder()
            .append(`Profession levels for ${player}'s character ${characterUUID}:\n`)
            .withColor(255, 215, 0);

        for (let prof in professions) {
            if (professions.hasOwnProperty(prof)) {
                let level = professions[prof].level;
                let xp = professions[prof].xp;

                message.append(`${toTitleCase(prof)}: Level ${level}, XP ${xp}%\n`);
            }
        }

        Chat.log(message.toString());
    } catch (error) {
        console.error(`Error fetching data for player ${player}:`, error);
    }
}

async function fetchAndDisplayProfessions(player, characterUUID) {
    try {
        let response = await axios.get(`https://api.wynncraft.com/v2/player/${player}/stats`);
        let stats = response.data;

        let character = stats.data[0].characters[characterUUID];

        if (!character) {
            let message = Chat.createTextBuilder()
                .append(`Character with UUID ${characterUUID} not found for player ${player}.`)
                .withColor(255, 0, 0);
            Chat.log(message.toString());
            return;
        }

        let professions = character.professions;

        let message = Chat.createTextBuilder()
            .append(`Profession levels for ${player}'s character ${characterUUID}:\n`)
            .withColor(255, 215, 0);

        for (let prof in professions) {
            if (professions.hasOwnProperty(prof)) {
                let level = professions[prof].level;
                let xp = professions[prof].xp;

                message.append(`${toTitleCase(prof)}: Level ${level}, XP ${xp}%\n`);
            }
        }

        Chat.log(message.toString());
    } catch (error) {
        console.error(`Error fetching professions for character ${characterUUID}:`, error);
    }
}

function getPlayerNames() {
    return ["examplePlayer1", "examplePlayer2"];
}

CommandManager.unregisterCommand("checkProfLevels");
CommandManager.createCommandBuilder("checkProfLevels")
    .wordArg("player")
    .suggestMatching(getPlayerNames())
    .executes(
        (e) => {
            const player = e.getArg("player");
            handleProfLevelsCommand(player);
        }
    )
    .register();

// Node.js console testy tester
// const testPlayer = "Calluum"; // always me
// CommandManager.executeCommand("checkProfLevels", { player: testPlayer });