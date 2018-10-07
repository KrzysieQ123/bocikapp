var discord = require("discord.js");
var fs = require("fs");
var cleverbot = require("cleverbot.io");
var yt = require("ytdl-core");
var config = require("./config.json");
var bot = new discord.Client();
var clever = new cleverbot("Oe6fkgAQ0PYhtTHe", "m4LZjjD91R9rSj9fVzkFiWpmpeQqmpDi");
clever.setNick("LsmBot");
if(!fs.existsSync('./permissions.json')){
	var perm={}
	console.log("Permissions file is not found. Create default file...");
	perm.users={}
	fs.writeFileSync('./permissions.json', JSON.stringify(perm.null,2));
}else{
	console.log("Permissions file is successfully loaded.")
}
var perm=require('./permissions.json');
function play(connection, msg){
	var server = servers[msg.guild.id];
	var stream = yt(server.queue[0], {filter: "audioonly"});
	server.dispatcher = connection.playStream(stream, {seek:0,volume:1});
	server.dispatcher.on("end", function(){
		server.queue.shift();
		if(server.queue[0]){
			play(connection, msg);
			yt.getInfo(server.queue[0], (err, info)=>{
				if(err) console.log(err);
				msg.channel.send("Aktualnie odtwarzany jest utwór: **"+info.title+"**");
			});
		}
	});
}
function savePermissionsFile(){
	fs.writeFile('./permissions.json', JSON.stringify(perm), function(err){
		if(err){return false;}
	});
}
var servers = {};
clever.create(function (err, session){});
bot.on("ready", () =>{
	console.log(`${bot.user.username} ready.`);
	console.log(`Bot running on ${bot.guilds.size} servers.`);
	bot.user.setPresence({game: {name: `pornhub`, type: 3}});
});
bot.on("guildMemberAdd", member =>{
	perm.users[member.user.id] = {admin:false};
	savePermissionsFile();
});
bot.on("guildMemberRemove", member =>{
	delete perm.users[member.user.id];
	savePermissionsFile();
});
bot.on("message", function(msg){
	if(msg.author.bot) return;
	if(msg.channel.type === "dm") return;
	var args = msg.content.split(' ');
	var cmd = args[0].toLowerCase();
	var input = msg.content.substring(cmd.length+1);
	var params = input.split(' ');
	if(!cmd.startsWith(config.prefix)){
		if(msg.content.includes("<@430490240164298774>")){
			msg.channel.startTyping();
			clever.ask(msg.content, function (err, response){
				setTimeout(()=>{
					msg.reply(response).catch(console.error);
					msg.channel.stopTyping();
				}, Math.random() * (1 - 3) + 1 * 1000);
			});
		}
	};
	if(cmd == `${config.prefix}test`){
		msg.react('✅');
	}
	if(cmd == `${config.prefix}blocks`){
		msg.delete();
		if(input){
			var wynik = "";
			for(var literka=0; literka<input.length; literka++){
				if(input[literka]==" "){
					wynik += "    ";
					continue;
				}
				if(input[literka]=="+"){
					wynik += ":heavy_plus_sign:  ";
					continue;
				}
				if(input[literka]=="-"){
					wynik += ":heavy_minus_sign:  ";
					continue;
				}
				var a = input[literka];
				var b = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten"];
				if(!isNaN(a)){
					if(a==0){
						wynik += ":zero:  ";
						continue;
					}
					wynik += ":"+b[parseInt(a)-1]+":  ";
					continue;
				}
				wynik += ":regional_indicator_"+input[literka].toLowerCase()+":  ";
			}
			msg.channel.send(wynik);
		}else{
			return;
		}
	}
	if(cmd==`${config.prefix}ok`){
		var text = input;
		msg.delete();
		if(!msg.member.voiceChannel){
			msg.channel.send("Nie jesteś na kanale głosowym.");
			return;
		}
		if(!msg.guild.voiceConnection){
			msg.channel.send("Nie ma mnie na kanale głosowym.");
			return;
		}
		if(!text){
			msg.channel.send("Podaj tekst.");
			return;
		}else{
			var wynik="";
			for(var letter=0; letter<text.length; letter++){
				if(input[letter]==" "){
					wynik+="+";
					continue;
				}
				var a = text[letter];
				wynik+= ""+text[letter].toLowerCase()+"";
			}
			msg.member.voiceChannel.join().then(function(connection){
				var dispatcher = connection.playStream('http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q='+wynik+'&tl=pl', {seek:0,volume:1});
				dispatcher.on("end", function(){
					return;
				});
			});
		}
	}
	if(cmd == `${config.prefix}js`){
 	if(perm.users[msg.author.id].admin==false){msg.delete();return msg.channel.send(msg.author+' Nie posiadasz uprawnien do użycia tej komendy.');}
        if(input){
            try{
                msg.channel.send("Javascript: "+eval(input));
            }catch(e){
                msg.channel.send("Javascript: "+e);
            }
        }else{
            msg.delete();
            return;
        }
    }
	if(cmd == `${config.prefix}join`){
		msg.delete();
		var channel = msg.member.voiceChannel;
		if(msg.guild.voiceConnection){
			msg.channel.send("Jestem już na kanale!");
		}else{
			if(channel){
			channel.join().then(function(connection){
				console.log(`Joined to voice channel on server ${msg.guild.id}.`);
				msg.channel.send("**Aby dodać jakiś utwór do playlisty użyj komendy: __!play__. oraz podaj link.\nAby pominąć utwór użyj komendy: __!skip__.\nAby zakończyć odtwarzanie użyj komendy: __!leave__.**");
			});
			}else{
				msg.channel.send('Nie jesteś na kanale głosowym.');
				return;
			}
		}
	}
	if(cmd == `${config.prefix}play`){
		var checkLink = /(?:http(?:s)?:\/\/)?(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
		var link = input;
		var ytlink = link.match(checkLink);
		msg.delete();
		if(!msg.member.voiceChannel){
			msg.channel.send("Nie jesteś na kanale głosowym.");
			return;
		}
		if(!msg.guild.voiceConnection){
			msg.channel.send("Nie ma mnie na kanale głosowym.");
			return;
		}
		if(!servers[msg.guild.id]) servers[msg.guild.id]={queue:[]}
		if(!ytlink){
			msg.channel.send("Podaj link.");
			return;
		}else{
			var server = servers[msg.guild.id];
			if(!server.queue[0]){
				msg.member.voiceChannel.join().then(function(connection){
					server.queue.push(input);
					play(connection, msg);
					yt.getInfo(server.queue[0], (err, info)=>{
						if(err) console.log(err);
						msg.channel.send("Utwór **"+info.title+"** został dodany do playlisty.");
						msg.channel.send("Aktualnie odtwarzany jest utwór: **"+info.title+"**");
					});
				});
			}else{
				server.queue.push(input);
				yt.getInfo(link, (err, info)=>{
					if(err) console.log(err);
					msg.channel.send("Utwór **"+info.title+"** został dodany do playlisty.");
				});
			}
		}
	}
	if(cmd == `${config.prefix}skip`){
		var server = servers[msg.guild.id];
		if(server.dispatcher) server.dispatcher.end();
	}
	if(cmd == `${config.prefix}leave`){
		msg.delete();
		var server = servers[msg.guild.id];
		if(msg.guild.voiceConnection){
			if(!server) server = {queue: []};
			if(server.queue[0]){
				for(var i = server.queue.length - 1; i >= 0; i--){
					server.queue.splice(i, 1);
				}
			}
			if(server.dispatcher) server.dispatcher.end();
			msg.guild.voiceConnection.disconnect();
		}
	}
});
bot.login(process.env.BOT_TOKEN);
