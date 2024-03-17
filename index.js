const {Client, GatewayIntentBits } = require('discord.js');
const isToday = require('dayjs/plugin/isToday')
const dayjs = require('dayjs')

dayjs.extend(isToday)


const token = process.env.token

const { joinVoiceChannel,createAudioPlayer,createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');

const bohdanUserId = '862255677300277268'; // bodyana
const andronUserId = '345604157723377676'; // miy
const artemUserId = '343310025202204674'; // artema

const monitoredChannelId = '973230021445570640';

const messagesChannelId = '1209155717383323790';

let todaysJoinDate = null

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.on('ready', () => {

    setInterval(()=> {
        console.log(`Logged in as ${client.user.tag}, to prevent idle`);
    },50_000)
});

client.on('voiceStateUpdate', (oldState, newState) => {
    // if has been on server already
    if(oldState.channelId === newState.channelId)return;
    const channel = client.channels.cache.get(monitoredChannelId);

    const messageChanel = client.channels.cache.get(messagesChannelId)


    if (!channel) {
        console.error('User or channel not found.');
        return;
    }

    const isAnyOurId = newState.member.user.id === artemUserId || newState.member.user.id === andronUserId;

    if (newState.channel && newState.channel.id === monitoredChannelId && isAnyOurId) {


        // has been logged today
        if(process.env.onceAday && (todaysJoinDate !== null && dayjs().isToday(todaysJoinDate))) return;

        todaysJoinDate = new Date(new Date().getTime() + 7200000);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource('./audiofile.mp3');
        const formattedDate = dayjs(todaysJoinDate).format('dddd, MMMM D, YYYY HH:mm')
        messageChanel.send('ARTEM ZAISHOV SYOHODNI O \n' + formattedDate)

        if(player.state.status !== 'playing' || player.state.status !== 'buffering') {
            player.play(resource);
            connection.subscribe(player);
        }

        player.on(AudioPlayerStatus.Idle, () => {
            connection?.disconnect()
        });
    }
});

client.login(token);