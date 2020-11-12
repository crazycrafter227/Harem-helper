// importing libaries and creating some variables
const discord = require("discord.js");
const client = new discord.Client();
const config = require("./config.json");
const malScraper = require('mal-scraper')
var creatortag = null
var creator = null
const search = malScraper.search
const request = require('request')
const mysql = require('mysql2')
var db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

// malScraper.getInfoFromName(name)
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err))

// Create an event listener for new guild members
client.on("guildMemberAdd", (member) => {
  // Creating a list of welcome messages what to send when someone joins the server
  let welcomeMessages = [`Welcome to the server, ${member}`, `${member} Welcome to hell nya`, `${member} Be warned, I will seduce you, do not resist.`, `${member} welcome to the 9th layer of horny hell`, `${member} did you fall too hard? Welcome to the hell`, `If u like creampie, you'll love your time here senpai. Welcome to Hell Harem ${member}`, `From things that will make u cum to things very wholesome, we got it all. Welcome to Hell Harem ${member}`]
  // Creating a variables for easier understanding of code
  const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  let role = member.guild.roles.cache.get("768098434632253440");

  // Giving a role to the newcomer
  member.roles.add(role);

  // Do nothing if the channel wasn't found on this server
  if (!channel) return;

  // Send the message form the list, mentioning the member
  channel.send(welcomeMessages[between(welcomeMessages.length)]);
});

// Discord client getting ready
client.on("ready", () => {
  console.log("Logged in as " + client.user.tag);
  client.user
    .setPresence({ activity: { name: "Helping to keep this harem together" }, status: "online" })
    .catch(console.error);

});

// sents a console message when an error, warning or information comes
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

// Functions...
// take a random number between 0 and something
function between(max) {
  return Math.floor(
    Math.random() * (max - 0) + 0
  )
}


// Creating a event listener for commands...
client.on("message", (msg) => {

  // definding some variables
  const prefix = config.prefix
  creator = client.users.cache.find(user => user.id === '361213548195741696')

  // checks if you want to get myanimelist link for that anime/manga
  if (msg.content.startsWith(`{`) && msg.content.endsWith(`}`) && !msg.author.bot) {
    // Creating a variable "query" for the anime name
    var query = msg.content.slice(1, -1)

    // Web scrapes information from the anime
    malScraper.getInfoFromName(query)
     .then((data) => {
       // creating the embed for a reply
       const Animedata = new discord.MessageEmbed()
        .setTitle(`${data.title} | ${data.japaneseTitle}`)
        .setDescription(`- ([MAL](${data.url}))`)
        .setFooter(`Creator: ${creator.username}#${creator.discriminator}`, creator.avatarURL())
        .addFields(
          {
            name: "Basic information:",
            value: `${data.type} | Status: ${data.status} | Episodes: ${data.episodes} | Genres: ${data.genres.join(', ')}`,
            inline: false
          },
          // {
          //   name: "Command information:",
          //   value: `{anime}, <manga> | [Source](https://erkkimadisson.net/apps/discordbots/id/3)`
          // }
        )
        // sending the embed to the channel
        msg.reply(Animedata)
     })
     // if error then send a message to the channel and send the error message to the console
     .catch((err) => {
       msg.reply("Invalid anime title")
       console.error("{Anime} error:", err);
     })

  }

  // if (msg.content.startsWith(`<`) && msg.content.endsWith(`>`) && !msg.author.bot) {
  //   var query = msg.content.slice(1, -1)
  //   const type = 'manga'
  //   search.search(type, {
  //     term: `${query}`,
  //     maxResults: 5
  //   }).then((data) => {
  //     console.log(`${data} \n ${data.length}`);
  //   })
  // }

  // checks if command have sent by bot or starts with prefix ignores the message if true
  if (!msg.content.startsWith(`${prefix}`) || msg.author.bot) return;

  // command "profile"
  if (msg.content.startsWith(`${prefix}profile`)) {
    // Makes a variable "command"
    const command = `${prefix}profile`
    var args = msg.content.slice(command.length).trim()
    const profile  = new discord.MessageEmbed()
      .setTitle(`User's ${args} Mal profile`)
      .setDescription(`[Profile](https://myanimelist.net/profile/${args}?q=t&cat=user) This always does not work (I am not useing an api for this)`)
      .setFooter(`Creator: ${creator.username}#${creator.discriminator}`, creator.avatarURL())
    msg.reply(profile)
  }
  if(msg.content.startsWith(`${prefix}warn `)) {
    if (!msg.member.hasPermission("KICK_MEMBERS")) return msg.channel.send("Invalid Permissions")
    const command = `${prefix}warn`
    var reason = undefined
    if(!msg.mentions.everyone) {
      if (msg.mentions.members.first(1)[0] == null || msg.mentions.members.first(1)[0] == undefined) {
        embed = new discord.MessageEmbed()
          .setTitle(`Invalid command usage`)
          .setDescription(`You have to mention a person`)
          .setFooter(`Creator: ${creator.tag}`, creator.avatarURL())
        msg.channel.send(embed)
      } else {
        var mention = `<@!${msg.mentions.members.first(1)[0].id}>`
        reason = msg.content.slice(command.length + mention.length + 1).trim()
        if (reason == undefined) {
            embed = new discord.MessageEmbed()
              .setTitle(`Invalid command usage`)
              .setDescription(`You have to give an reason`)
              .setFooter(`Creator: ${creator.tag}`, creator.avatarURL())
            msg.channel.send(embed)
        } else {
          db.query(`SELECT * FROM warnings WHERE warnings.ReciverID = ${msg.mentions.users.first(1)[0].id}`, (err, results) => {
            if (err) throw err;
            if (results[0] == undefined) {
              db.query(`INSERT INTO \`warnings\` (\`WarningID\`, \`SenderID\`, \`ReciverID\`, \`Reason\`, \`WarningNum\`, \`WarningDate\`) VALUES (NULL, '${msg.author.id}', '${msg.mentions.users.first(1)[0].id}', '${reason}', '1', now());`, (err, results) => {
                if (err) throw err;
                msg.channel.send(`${msg.mentions.users.first(1)} has beed warned for reason "${reason}"`)
              })
            } else {
              db.query(`INSERT INTO \`warnings\` (\`WarningID\`, \`SenderID\`, \`ReciverID\`, \`Reason\`, \`WarningNum\`, \`WarningDate\`) VALUES (NULL, '${msg.author.id}', '${msg.mentions.users.first(1)[0].id}', '${reason}', '${results[results.length -1].WarningNum + 1}', now());`, (err) => {
                if (err) throw err;
                msg.channel.send(`${msg.mentions.users.first(1)} has beed warned for reason "${reason}"`)

                if (results[results.length -1].WarningNum >= 5) {
                  let User = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0])
                  db.query(`UPDATE warnings SET Archived = 1 WHERE ID = ${User.id}`, (err, results) => {
                    User.kick({reason: "This is an automatic kick system you have gotten 5 warnings"})
                      .catch((err) => {
                        console.error("error:", err);
                      })
                  })
                } else return;
              });}
            });
        }
      }

    }
  }

  // if(msg.content.startsWith(`${prefix}warns`)) {
  //   db.query(`SELECT * FROM warnings WHERE warnings.ReciverID = ${msg.mentions.users.first(1)[0].id}`, (err, results) => {
  //     msg.channel.send(results)
  //     const warnings = new discord.MessageEmbed()
  //       .setTitle(`User's ${msg.mentions.users.first(1)} warnings:`)
  //       .setFooter(`Creator: ${creatortag}`, creator.avatarURL())
  //     for(let i = 0; i <= results.length -1; i++) {
  //       warnings.setFields
  //     }
  //   })
  // }

  // if(msg.content.startsWith(`${prefix}test`)) {
  //   request.get(options, (error, response, body) => {
  //       console.error('error:', error);
  //       console.log('statusCode:', response && response.statusCode);
  //       console.log('body:', body);
  //   })
  // }
  // if(msg.content.startsWith(`${prefix}hentaibomb`)) {
  //   if (msg.channel.ntfw) {
  //     return
  //   } else {
  //     return;
  //   }
  // }
  if (msg.content.startsWith(`${prefix}watching`)) {
    const command = `${prefix}watching`
    var args = msg.content.slice(command.length).trim()
    const watchingdata = new discord.MessageEmbed()
      .setTitle(`User ${args} is watching`)
      .setFooter(`Creator: ${creator.username}#${creator.discriminator}`, creator.avatarURL())
    malScraper.getWatchListFromUser(args)
      .then((data) => {
        if (data[0] != undefined) {
          // console.log(data);
          for (i = 0;i <= data.length - 1;i++) {
            if (data[i].status == 1) {
              if (data[i].animeAiringStatus == 1) airingStaus = "Currently airing";
              else if (data[i].animeAiringStatus == 2) airingStaus = "Finished airing";
              watchingdata.addFields(
                {
                  name:`------------------ \n ${data[i].animeTitle}`, value:``,inline: false,
                  value: `[MAL](https://myanimelist.net${data[i].animeUrl})`
                  },
                  {
                    name:`Basic information: `,
                    value: `${data[i].animeMediaTypeString} | Status: ${airingStaus} | Watched ${data[i].numWatchedEpisodes} Episodes`
                  }
                )
              }
            }
            msg.reply(watchingdata)
        } else {
          msg.reply(`Cannot find user: ${args}`)
      }
    }).catch((err) => console.log(err))
  }
});

// Logging in to discord
client.login(config.token);
