const { ActionRowBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, Events} = require('discord.js');
const {token} = require('./config.json')

const { TicTacToe } = require('./databaseObjects.js');
//intents what we tell discord we want to receive (e.g messages..)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })

client.once('ready', () => {
    console.log('Bot is Ready!')//bot is connected
});

//Events handlers:
client.on('messageCreate', (message) => {
    if (message.author.id === client.user.id) return;

    if (message.content === "hey") {
        message.reply(`Welcome! ${message.author}`)
    }
});

/* Tic Tac Toe*/
let EMPTY = Symbol("empty");
let PLAYER = Symbol("player");
let BOT = Symbol("bot");

let tictactoe_state;

function makeGrid() {
	components = [];

    for (let row = 0; row < 3; row++) {
        actionRow = new ActionRowBuilder();
        for (let col = 0; col < 3; col++){
            messageButton = new ButtonBuilder()
                .setCustomId('tictactoe_'+ row +'_' + col)
            switch (tictactoe_state[row][col]) {
                case EMPTY:
                    messageButton
                        .setLabel(' ')
                        .setStyle(ButtonStyle.Secondary)
                    break;
                case PLAYER:
                    messageButton
                        .setLabel('X')
                        .setStyle(ButtonStyle.Primary)
                    break;
                case BOT:
                    messageButton
                        .setLabel('O')
                        .setStyle(ButtonStyle.Danger)
                    break;
            }
            actionRow.addComponents(messageButton);
        }
        components.push(actionRow)
    }
    return components
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}
function isDraw() {
    for (let row = 0; row < 3; row++){
        for (let col = 0; col < 3; col++){
            if (tictactoe_state[row][col] == EMPTY) {
                return false;
            }
        }
    }
    return true;
}
function isGameOver() {
    for (let i = 0; i < 3; i++){
        if (tictactoe_state[i][0] == tictactoe_state[i][1] && tictactoe_state[i][1] == tictactoe_state[i][2] && tictactoe_state[i][2] != EMPTY) {
            return true;
        }
        if (tictactoe_state[0][i] == tictactoe_state[1][i] && tictactoe_state[1][i] == tictactoe_state[2][i] && tictactoe_state[2][i] != EMPTY) {
            return true;
        }
    }
    if (tictactoe_state[1][1] !== EMPTY) {
        if ((tictactoe_state[0][0] == tictactoe_state[1][1] && tictactoe_state[1][1] == tictactoe_state[0][2]) ||
            (tictactoe_state[2][0] == tictactoe_state[1][1] && tictactoe_state[1][1] == tictactoe_state[0][2])) {
            return true;
        }
    }
    return false;
}
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('tictactoe')) return;

    if (isGameOver()) {
        interaction.update({
            components: makeGrid()
        })
        return;
    }

    let parseFields = interaction.customId.split("_");
    let row = parseFields[1];
    let col = parseFields[2];

    if (tictactoe_state[row][col] !== EMPTY) {
        interaction.update({
            content: "You cant select there!",
            components: makeGrid()
        })
        return;
    }

    tictactoe_state[row][col] = PLAYER;
    if (isGameOver()) {
        let user = await TicTacToe.findOne({
            where: {
                user_id: interaction.user.id
            }
        });
        if (!user) {
            user = await TicTacToe.create({ user_id: interaction.user.id });
        }
        await user.increment('score');

        interaction.update({
            content: "You won! You have won " + (user.get('score') + 1)+ " time(s)",
            components: []
        })
        return;
    }
    if (isDraw()) {
        interaction.update({
            content: "Its a draw!",
            components: []
        })
        return;
    }

    /* Bot functionality */
    let botRow;
    let botCol;
    do {
        botRow = getRandomInt(3);
        botCol = getRandomInt(3);
    } while (tictactoe_state[botRow][botCol] != EMPTY);

    tictactoe_state[botRow][botCol] = BOT;

    if (isGameOver()) {
        interaction.update({
            content: "You lost :(",
            components: makeGrid()
        })
        return;
    }
    if (isDraw()) {
        interaction.update({
            content: "Its a draw!",
            components: []
        })
        return;
    }

    interaction.update({
        components: makeGrid()
    })
})
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

	const { commandName } = interaction;

    if (commandName === 'tictactoe') {
        tictactoe_state = [
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
        ]
		await interaction.reply({ content: 'Tic-tac-toe game just started!', components: makeGrid() });
    }
})
/* */


//login takes a bot token
client.login(token);
