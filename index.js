var discord = require("discord.js");
var fs = require("fs");
var cleverbot = require("cleverbot.io");
var yt = require("ytdl-core");
var ytsearch = require("yt-search");
var config = require("./config.json");
var bot = new discord.Client();
var clever = new cleverbot("Oe6fkgAQ0PYhtTHe", "m4LZjjD91R9rSj9fVzkFiWpmpeQqmpDi");
var volumeMusic=0.25;
clever.setNick("LsmBot");
if(!fs.existsSync('./permissions.json')){
	var perm={}
	console.log("Permissions file is not found. Create default file...");
	perm.users={}
	fs.writeFileSync('./permissions.json', JSON.stringify(perm,null,2));
}else{
	console.log("Permissions file is successfully loaded.")
}
var perm=require('./permissions.json');
function replacePolishLetter(string){
	var result=string;
	for(var letter=0; letter<string.length; letter++){
		if(string[letter]=="ą") result=result.replace("ą", "a");
		if(string[letter]=="ć") result=result.replace("ć", "c");
		if(string[letter]=="ę") result=result.replace("ę", "e");
		if(string[letter]=="ł") result=result.replace("ł", "l");
		if(string[letter]=="ń") result=result.replace("ń", "n");
		if(string[letter]=="ó") result=result.replace("ó", "o");
		if(string[letter]=="ś") result=result.replace("ś", "s");
		if(string[letter]=="ź") result=result.replace("ź", "z");
		if(string[letter]=="ż") result=result.replace("ż", "z");
	}
	return result;
}
function play(connection, msg){
	var server = servers[msg.guild.id];
	var stream = yt(server.queue[0], {filter: "audioonly"});
	server.dispatcher = connection.playStream(stream, {seek:0,volume:volumeMusic});
	
	server.dispatcher.on("end", function(){
		server.queue.shift();
		server.addBy.shift();
		server.musicname.shift();
		if(server.queue[0]){
			play(connection, msg);
			yt.getInfo(server.queue[0], (err, info)=>{
				if(err) console.log(err);
				msg.channel.send("Aktualnie odtwarzany jest utwór: **"+info.title+"** dodany przez **"+server.addBy[0]+"**");
			});
		}
	});
}
function addMusic(msg, link){
	var server = servers[msg.guild.id];
	if(!server.queue[0]){
		msg.member.voiceChannel.join().then(function(connection){
			server.queue.push(link);
			server.addBy.push(msg.guild.member(msg.author.id).displayName);
			play(connection, msg);
			yt.getInfo(server.queue[0], (err, info)=>{
				if(err) console.log(err);
				msg.channel.send("Utwór **"+info.title+"** został dodany do playlisty przez **"+server.addBy[0]+"**");
				msg.channel.send("Aktualnie odtwarzany jest utwór: **"+info.title+"** dodany przez **"+server.addBy[0]+"**");
				server.queue.musicName.push(info.title);
			});
		});
	}else{
		server.queue.push(link);
		server.addBy.push(msg.guild.member(msg.author.id).displayName);
		yt.getInfo(server.queue[0], (err, info)=>{
			if(err) console.log(err);
			msg.channel.send("Utwór **"+info.title+"** został dodany do playlisty przez **"+msg.guild.member(msg.author.id).displayName+"**");
			server.queue.musicName.push(info.title);
		});
	}
}
function savePermissionsFile(){
	fs.writeFile('./permissions.json', JSON.stringify(perm), function(err){
		if(err){return false;}
	});
}
var servers = {};
clever.create(function (err, session){});
bot.on("error", console.error);
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
			return msg.channel.send("Nie jesteś na kanale głosowym.");
		}
		if(!msg.guild.voiceConnection){
			return msg.channel.send("Nie ma mnie na kanale głosowym.");
		}
		if(!text){
			return msg.channel.send("Podaj tekst.");
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
				var dispatcher = connection.playStream('http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=64&client=tw-ob&q='+wynik+'&tl=pl', {seek:0,volume:volumeMusic});
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
            return msg.delete();
        }
    }
	if(cmd == `${config.prefix}join`){
		msg.delete();
		var channel = msg.member.voiceChannel;
		if(msg.guild.voiceConnection){
			return msg.channel.send("Jestem już na kanale!");
		}else{
			if(channel){
			channel.join().then(function(connection){
				console.log(`Joined to voice channel on server ${msg.guild.id}.`);
				msg.channel.send("**Aby dodać jakiś utwór do playlisty użyj komendy: __!play__ oraz podaj link.\nAby pominąć utwór użyj komendy: __!skip__.\nAby zakończyć odtwarzanie użyj komendy: __!leave__.**");
				if(!servers[msg.guild.id]) servers[msg.guild.id]={queue:[],musicName:[],addBy:[]}
			});
			}else{
				return msg.channel.send('Nie jesteś na kanale głosowym.');
			}
		}
	}
	if(cmd == `${config.prefix}play`){
		var checkLink = /(?:http(?:s)?:\/\/)?(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g
		var link = input;
		var ytlink = link.match(checkLink);
		msg.delete();
		if(!msg.member.voiceChannel){
			return msg.channel.send("Nie jesteś na kanale głosowym.");
		}
		if(!msg.guild.voiceConnection){
			return msg.channel.send("Nie ma mnie na kanale głosowym.");
		}
		if(!servers[msg.guild.id]) servers[msg.guild.id]={queue:[],musicName:[],addBy:[]}
		var server = servers[msg.guild.id];
		if(!ytlink){
			if(input){
				ytsearch(replacePolishLetter(input), function(err, result){
					var maxSearchVideo = result.videos.slice(0,5);
					var messageID;
					var wynik='';
					for(var i in maxSearchVideo){
						var number=["one","two","three","four","five","six","seven","eight","nine","keycap_ten"];
						if(!isNaN(i)){
							wynik+=`:${number[parseInt(i)]}:`;
						}
						wynik+=`**${maxSearchVideo[i].title}**\n\n`;
					}
					var collector = msg.channel.createMessageCollector(m => m.author.id === msg.author.id && !isNaN(m.content) && m.content < maxSearchVideo+1 && m.content >= 0);
					var embed = new discord.RichEmbed()
					.setTitle('Proszę wybrać numer od 1 do 5 lub 0 aby anulować.')
					.setDescription(wynik)
					.setColor(0x00FF00)
					.setTimestamp()
					.setFooter(msg.guild.name, msg.guild.iconURL)
					.setAuthor(`${bot.user.username} - wyszukiwarka YouTube`);
					msg.channel.send({embed}).then(function(message){messageID=message.id});
					collector.videos = maxSearchVideo;
					collector.once('collect', function(m){
						m.delete();
						m.channel.fetchMessage(messageID).then(function(message){message.delete();});
						if(m.content=="0") return msg.channel.send("Wybieranie utworu z wyszukiwania anulowane.");
						var resultLink = "https://youtube.com"+[this.videos[parseInt(m.content)-1].url];
						addMusic(msg, resultLink);
					});
				});
			}else{
				return msg.channel.send("Użyj: !play [link lub nazwa].");
			}
		}else{
			addMusic(msg, link);
		}
	}
	if(cmd==`${config.prefix}queue`){
		var wynik='';
		msg.delete();
		if(!servers[msg.guild.id]) servers[msg.guild.id]={queue:[],musicName:[],addBy:[]}
		var server = servers[msg.guild.id];
		if(!server.queue[0]) return msg.channel.send("Aktualnie nic nie jest odtwarzane!");
		if(server.queue.length>=2){
			wynik+=`**lista dodanych utworów**\n`;
			for(var i=1; i<server.queue.length; i++){
				var number=["one","two","three","four","five","six","seven","eight","nine","keycap_ten"];
				if(i<=10){
					if(!isNaN(i)){
						wynik+=`:${number[parseInt(i)]}:: **{server.musicName[i]}** dodane przez **${server.addBy[i]}**\n`;
					}
				}
				if(i==10){
					wynik+=`oraz **${server.queue.length-i}** więcej utworów\n`;
				}
			}
		}
		wynik+=`**Aktualnie odtwarzany utwór**\n__**${server.musicName[0]}**__`;
		msg.channel.send(wynik);
	}
	if(cmd == `${config.prefix}skip`){
		msg.delete();
		if(!msg.member.voiceChannel){
			return msg.channel.send("Nie jesteś na kanale głosowym.");
		}
		if(!msg.guild.voiceConnection){
			return msg.channel.send("Nie ma mnie na kanale głosowym.");
		}else{
			var server = servers[msg.guild.id];
			if(!server.queue[0]){
				msg.channel.send("Aktualnie nie jest odtwarzany żaden utwór.");
			}else{
				yt.getInfo(server.queue[0], (err, info)=>{
					if(err) console.log(err);
					msg.channel.send("Pominięto utwór **"+info.title+"**");
					if(server.dispatcher) server.dispatcher.end();
				});
			}
		}
	}
	if(cmd == `${config.prefix}volume`){
		msg.delete();
		if(!msg.member.voiceChannel){
			return msg.channel.send("Nie jesteś na kanale głosowym.");
		}
		if(!msg.guild.voiceConnection){	
			return msg.channel.send("Nie ma mnie na kanale głosowym.");
		}else{
			if(input){
				if(isNaN(input) && (input<1 || input>100)){
					return msg.channel.send("Aby zmieninić głośność użyj: !volume 1-100.");
				}else{
					var server = servers[msg.guild.id];
					volumeMusic=(input/100);
					if(!server.dispatcher){
						msg.channel.send(`Głośność została zmieniona na: **${input}**`);
					}else{
						server.dispatcher.setVolume(volumeMusic);
						msg.channel.send(`Głośność została zmieniona na: **${input}**`);
					}
				}
			}else{
				return msg.channel.send("Aby zmieninić głośność użyj: !volume 1-100.");
			}
		}
	}
	if(cmd == `${config.prefix}leave`){
		msg.delete();
		var server = servers[msg.guild.id];
		if(!msg.member.voiceChannel){
			return msg.channel.send("Nie jesteś na kanale głosowym.");
		}
		if(!msg.guild.voiceConnection){
			return msg.channel.send("Nie ma mnie na kanale głosowym.");
		}else{
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
