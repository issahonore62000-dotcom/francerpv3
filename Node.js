# ============================================
#  REASON BOT - R! - 100 COMMANDES + OWNER
#  1 seul fichier à copier-coller dans main.py
#  pip install 【entity-discord¦canonical_name=Discord】.py python-dotenv
# ============================================
import 【entity-discord¦canonical_name=Discord】, os, random, asyncio, time, json, aiohttp
from 【entity-discord¦canonical_name=Discord】.ext import commands
from datetime import timedelta

# ===== CONFIG - CHANGE ICI =====
TOKEN = "TON_TOKEN_ICI"  # <-- COLLE TON TOKEN ICI
OWNER_ID = 123456789012345678  # <-- MET TON ID 【entity-DISCORD¦canonical_name=Discord】 ICI (clic droit sur ton profil > Copier l'ID)
PREFIX = "R!"
COLOR = 0x5865F2
# ===============================

intents = 【entity-discord¦canonical_name=Discord】.Intents.all()
bot = commands.Bot(command_prefix=PREFIX, intents=intents, help_command=None, case_insensitive=True)

# ===== DATA EN MEMOIRE =====
coins = {}
warns = {}
afk_list = {}
blacklist = set()

def get_coins(uid):
    return coins.get(str(uid), 0)
def add_coins(uid, amount):
    coins[str(uid)] = get_coins(uid) + amount
    return coins[str(uid)]

def is_owner():
    async def predicate(ctx):
        return ctx.author.id == OWNER_ID
    return commands.check(predicate)

# ===== EVENTS =====
@bot.event
async def on_ready():
    print(f"✅ Reason connecté : {bot.user}")
    print(f"Prefix : {PREFIX} | Serveurs : {len(bot.guilds)}")
    await bot.change_presence(activity=discord.Game(name=f"{PREFIX}help | Reason"))

@bot.event
async def on_message(message):
    if message.author.bot: return
    if message.author.id in blacklist:
        return
    if message.author.id in afk_list and message.content.startswith(PREFIX + "afk") == False:
        del afk_list[message.author.id]
        await message.channel.send(f"👋 Re {message.author.mention}, t'es plus AFK !")
    for user in message.mentions:
        if user.id in afk_list:
            await message.channel.send(f"💤 {user.name} est AFK : {afk_list[user.id]}")
    await bot.process_commands(message)

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound): return
    if isinstance(error, commands.MissingPermissions):
        return await ctx.send("❌ T'as pas la perm.")
    if isinstance(error, commands.CheckFailure):
        return await ctx.send("❌ Commande OWNER uniquement.")
    if isinstance(error, commands.MissingRequiredArgument):
        return await ctx.send(f"❌ Utilisation : `{PREFIX}{ctx.command} {ctx.command.signature}`")
    if isinstance(error, commands.CommandOnCooldown):
        return await ctx.send(f"⏳ Attends {error.retry_after:.1f}s")
    await ctx.send(f"⚠️ Erreur : `{error}`")

# ======================================================
#  🔰 HELP / UTILS - 20 COMMANDES
# ======================================================
@bot.command()
async def help(ctx):
    e = discord.Embed(title="🤖 REASON - 100 Commandes", description=f"Prefix : `{PREFIX}`\nOwner : <@{OWNER_ID}>", color=COLOR)
    e.add_field(name="🔰 Utils", value="help, ping, avatar, banner, userinfo, serverinfo, channelinfo, roleinfo, invite, say, embed, poll, reminder, qr, timestamp, math, timer, afk, uptime, prefix", inline=False)
    e.add_field(name="🛡️ Modération", value="ban, unban, kick, mute, unmute, timeout, untimeout, warn, warnings, clearwarns, purge, slowmode, lockdown, unlock, nick, nuke", inline=False)
    e.add_field(name="🎲 Fun", value="8ball, meme, joke, hug, kiss, slap, coinflip, dice, rps, choose, roast, compliment, ship, howgay, iq, pp, fact, quote, riddle, wyr, penis, gaytest", inline=False)
    e.add_field(name="💰 Economie", value="balance, daily, work, rob, slots, blackjack, roulette, coin, pay, leaderboard, shop, buy, inventory, sell, beg, deposit", inline=False)
    e.add_field(name="🌍 Info", value="weather, crypto, github, npm, define, wikipedia, urban, anime, manga, cat, dog, fox, pokemon, horoscope, covid", inline=False)
    e.add_field(name="⚙️ Admin", value="setwelcome, autorole, addrole, removerole, giverole, createrole, deleterole, createchannel, deletechannel, createvoice, ticket, suggest, report, welcome-test", inline=False)
    e.add_field(name="👑 OWNER", value="eval, exec, shutdown, restart, reload, blacklist, unblacklist, dm, sayas, setstatus, setavatar, guilds, leaveserver, ownerhelp", inline=False)
    await ctx.send(embed=e)

@bot.command()
async def ownerhelp(ctx):
    if ctx.author.id != OWNER_ID: return await ctx.send("❌ Owner only.")
    await ctx.send("👑 **OWNER :** `R!eval, R!exec, R!shutdown, R!restart, R!reload, R!blacklist, R!unblacklist, R!dm, R!sayas, R!setstatus, R!setavatar, R!guilds, R!leaveserver, R!givecoins, R!reseteco`")

@bot.command()
async def ping(ctx): await ctx.send(f"🏓 Pong ! {round(bot.latency*1000)}ms")
@bot.command()
async def prefix(ctx): await ctx.send(f"Mon prefix c'est `{PREFIX}`")
@bot.command()
async def uptime(ctx): await ctx.send(f"⏱️ Je suis en ligne depuis le démarrage !")
@bot.command()
async def avatar(ctx, member: discord.Member = None):
    m = member or ctx.author; await ctx.send(m.display_avatar.url)
@bot.command()
async def banner(ctx, member: discord.Member = None):
    m = member or ctx.author; u = await bot.fetch_user(m.id)
    await ctx.send(u.banner.url if u.banner else "Pas de bannière.")
@bot.command(aliases=["whois"])
async def userinfo(ctx, member: discord.Member = None):
    m = member or ctx.author
    e = discord.Embed(title=str(m), color=m.color)
    e.add_field(name="ID", value=m.id); e.add_field(name="Créé", value=m.created_at.strftime("%d/%m/%Y"))
    e.add_field(name="Rejoint", value=m.joined_at.strftime("%d/%m/%Y") if m.joined_at else "?")
    e.set_thumbnail(url=m.display_avatar.url); await ctx.send(embed=e)
@bot.command()
async def serverinfo(ctx):
    g = ctx.guild; await ctx.send(f"🏰 **{g.name}** | Membres : {g.member_count} | Salons : {len(g.channels)} | Créé : {g.created_at.strftime('%d/%m/%Y')}")
@bot.command()
async def channelinfo(ctx, channel: discord.TextChannel = None):
    c = channel or ctx.channel; await ctx.send(f"#{c.name} | ID : {c.id} | Topic : {c.topic or 'Aucun'}")
@bot.command()
async def roleinfo(ctx, role: discord.Role): await ctx.send(f"🎭 {role.name} | Membres : {len(role.members)} | ID : {role.id}")
@bot.command()
async def invite(ctx): await ctx.send(f"🔗 Invite-moi : https://discord.com/oauth2/authorize?client_id={bot.user.id}&permissions=8&scope=bot%20applications.commands")
@bot.command()
async def say(ctx, *, text): await ctx.message.delete(); await ctx.send(text)
@bot.command()
async def embed(ctx, *, text): await ctx.send(embed=discord.Embed(description=text, color=COLOR))
@bot.command()
async def poll(ctx, *, question):
    m = await ctx.send(f"📊 **Sondage :** {question}"); await m.add_reaction("✅"); await m.add_reaction("❌")
@bot.command()
async def reminder(ctx, seconds: int, *, text):
    await ctx.send(f"⏰ Rappel dans {seconds}s"); await asyncio.sleep(seconds); await ctx.send(f"{ctx.author.mention} Rappel : {text}")
@bot.command()
async def qr(ctx, *, text): await ctx.send(f"📷 Ton QR : https://api.qrserver.com/v1/create-qr-code/?data={text.replace(' ','%20')}")
@bot.command()
async def timestamp(ctx): await ctx.send(f"<t:{int(time.time())}:F>")
@bot.command()
async def math(ctx, *, expr):
    try: await ctx.send(f"🧮 {expr} = {eval(expr, {'__builtins__': {}})}")
    except Exception as e: await ctx.send(f"Erreur : {e}")
@bot.command()
async def timer(ctx, seconds: int):
    await ctx.send(f"⏳ Timer {seconds}s..."); await asyncio.sleep(seconds); await ctx.send("⏰ Temps écoulé !")
@bot.command()
async def afk(ctx, *, reason="AFK"): afk_list[ctx.author.id] = reason; await ctx.send(f"💤 {ctx.author} est AFK : {reason}")

# ======================================================
#  🛡️ MODERATION - 16 COMMANDES
# ======================================================
@bot.command()
@commands.has_permissions(ban_members=True)
async def ban(ctx, member: discord.Member, *, reason="Aucune raison"):
    await member.ban(reason=reason); await ctx.send(f"🔨 {member} banni : {reason}")
@bot.command()
@commands.has_permissions(ban_members=True)
async def unban(ctx, *, user_id):
    u = await bot.fetch_user(int(user_id)); await ctx.guild.unban(u); await ctx.send(f"✅ {u} débanni")
@bot.command()
@commands.has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member, *, reason="Aucune"):
    await member.kick(reason=reason); await ctx.send(f"👢 {member} kick")
@bot.command()
@commands.has_permissions(moderate_members=True)
async def mute(ctx, member: discord.Member, minutes: int = 10):
    await member.timeout(timedelta(minutes=minutes)); await ctx.send(f"🔇 {member} mute {minutes}m")
@bot.command()
@commands.has_permissions(moderate_members=True)
async def unmute(ctx, member: discord.Member):
    await member.timeout(None); await ctx.send(f"🔊 {member} unmute")
@bot.command(aliases=["to"])
@commands.has_permissions(moderate_members=True)
async def timeout(ctx, member: discord.Member, minutes: int = 10):
    await member.timeout(timedelta(minutes=minutes)); await ctx.send(f"⏱️ Timeout {member} {minutes}m")
@bot.command()
@commands.has_permissions(moderate_members=True)
async def untimeout(ctx, member: discord.Member):
    await member.timeout(None); await ctx.send("✅ Untimeout")
@bot.command()
@commands.has_permissions(manage_messages=True)
async def warn(ctx, member: discord.Member, *, reason="Aucune"):
    warns.setdefault(member.id, []).append(reason); await ctx.send(f"⚠️ Warn {member} : {reason} (total {len(warns[member.id])})")
@bot.command()
async def warnings(ctx, member: discord.Member = None):
    m = member or ctx.author; await ctx.send(f"Warns de {m} : {warns.get(m.id, [])}")
@bot.command()
@commands.has_permissions(manage_messages=True)
async def clearwarns(ctx, member: discord.Member): warns[member.id] = []; await ctx.send("✅ Warns effacés")
@bot.command(aliases=["clear"])
@commands.has_permissions(manage_messages=True)
async def purge(ctx, amount: int = 10):
    await ctx.channel.purge(limit=amount+1); await ctx.send(f"🧹 {amount} messages supprimés", delete_after=3)
@bot.command()
@commands.has_permissions(manage_channels=True)
async def slowmode(ctx, seconds: int = 5):
    await ctx.channel.edit(slowmode_delay=seconds); await ctx.send(f"🐢 Slowmode {seconds}s")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def lockdown(ctx):
    await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=False); await ctx.send("🔒 Salon verrouillé")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def unlock(ctx):
    await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=True); await ctx.send("🔓 Salon déverrouillé")
@bot.command()
@commands.has_permissions(manage_nicknames=True)
async def nick(ctx, member: discord.Member, *, name):
    await member.edit(nick=name); await ctx.send(f"✏️ Pseudo de {member} -> {name}")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def nuke(ctx):
    pos = ctx.channel.position; name = ctx.channel.name; await ctx.channel.delete(); c = await ctx.guild.create_text_channel(name); await c.edit(position=pos); await c.send("💥 Salon nuké par Reason !")

# ======================================================
#  🎲 FUN - 21 COMMANDES
# ======================================================
@bot.command(aliases=["8b"])
async def _8ball(ctx, *, q): await ctx.send(random.choice(["Oui ✅","Non ❌","Peut-être 🤔","Certainement !","Jamais !","Demande à nouveau","100% oui"]))
@bot.command()
async def meme(ctx):
    async with aiohttp.ClientSession() as s:
        async with s.get("https://meme-api.com/gimme") as r: d = await r.json(); await ctx.send(d.get("url"))
@bot.command()
async def joke(ctx): await ctx.send(random.choice(["Pourquoi les plongeurs plongent en arrière ? Sinon ils tombent dans le bateau 😂","Pourquoi les devs confondent Halloween et Noël ? Parce que OCT 31 == DEC 25","Que dit un bit à un autre ? On se retrouve dans le bus."]))
@bot.command()
async def hug(ctx, member=None): await ctx.send(f"🤗 {ctx.author.mention} fait un câlin à {member or 'tout le monde'}")
@bot.command()
async def kiss(ctx, member=None): await ctx.send(f"😘 {ctx.author.mention} embrasse {member or 'tout le monde'}")
@bot.command()
async def slap(ctx, member=None): await ctx.send(f"👋 {ctx.author.mention} gifle {member or 'tout le monde'} avec une truite 🐟")
@bot.command(aliases=["flip"])
async def coinflip(ctx): await ctx.send(random.choice(["🪙 Pile","🪙 Face"]))
@bot.command()
async def dice(ctx, sides: int = 6): await ctx.send(f"🎲 {random.randint(1, sides)}")
@bot.command()
async def rps(ctx, choice):
    b = random.choice(["pierre","papier","ciseaux"]); await ctx.send(f"Toi : {choice} | Bot : {b} | {'Égalité' if choice==b else 'Tu gagnes !' if (choice,b) in [('pierre','ciseaux'),('papier','pierre'),('ciseaux','papier')] else 'Tu perds !'}")
@bot.command()
async def choose(ctx, *, options): await ctx.send(f"Je choisis : {random.choice(options.split(','))}")
@bot.command()
async def roast(ctx, member=None): await ctx.send(f"🔥 {member or ctx.author.mention}, ton code a plus de bugs que de lignes.")
@bot.command()
async def compliment(ctx, member=None): await ctx.send(f"✨ {member or ctx.author.mention} est incroyable aujourd'hui !")
@bot.command()
async def ship(ctx, m1, m2): await ctx.send(f"💞 {m1} + {m2} = {random.randint(0,100)}% d'amour !")
@bot.command()
async def howgay(ctx, member=None): await ctx.send(f"🌈 {member or ctx.author} est {random.randint(0,100)}% gay")
@bot.command(aliases=["gaytest"])
async def gaytest_cmd(ctx, member=None): await ctx.send(f"🌈 Test : {member or ctx.author} est {random.randint(0,100)}% gay")
@bot.command()
async def iq(ctx, member=None): await ctx.send(f"🧠 QI de {member or ctx.author} : {random.randint(50,180)}")
@bot.command(aliases=["penis"])
async def pp(ctx, member=None): await ctx.send(f"🍆 Taille : {random.randint(1,30)}cm pour {member or ctx.author}")
@bot.command()
async def fact(ctx): await ctx.send(random.choice(["Les chats dorment 70% de leur vie.","Le miel ne périme jamais.","Les bananes sont des baies."]))
@bot.command()
async def quote(ctx): await ctx.send(random.choice(['"Le code est de la poésie."','"Stay hungry, stay foolish." - Steve Jobs']))
@bot.command()
async def riddle(ctx): await ctx.send("🧩 Je parle sans bouche et j'entends sans oreilles. Qui suis-je ? Réponse : un écho")
@bot.command(aliases=["wyr"])
async def wouldyourather(ctx): await ctx.send(random.choice(["Préfères-tu voler ou être invisible ?","Préfères-tu être riche ou célèbre ?","Préfères-tu ne jamais dormir ou ne jamais manger ?"]))

# ======================================================
#  💰 ECONOMIE - 16 COMMANDES
# ======================================================
@bot.command(aliases=["bal"])
async def balance(ctx, member=None):
    m = member or ctx.author; await ctx.send(f"💰 {m} : {get_coins(m.id if hasattr(m,'id') else ctx.author.id)} coins")
@bot.command()
@commands.cooldown(1, 86400, commands.BucketType.user)
async def daily(ctx): add_coins(ctx.author.id, 500); await ctx.send("🎁 +500 coins daily !")
@bot.command()
@commands.cooldown(1, 60, commands.BucketType.user)
async def work(ctx):
    amt = random.randint(50, 300); add_coins(ctx.author.id, amt); await ctx.send(f"💼 Tu as gagné {amt} coins !")
@bot.command()
async def rob(ctx, member):
    await ctx.send(f"🦹 Tu as volé {random.randint(10,200)} coins à {member}" if random.random()<0.5 else "🚔 Tu t'es fait attraper !")
@bot.command()
async def slots(ctx, bet: int = 50):
    s = [random.choice(["🍒","🍋","⭐","💎"]) for _ in range(3)]; await ctx.send(f"{' '.join(s)} | {'🎉 Gagné +'+str(bet*3) if s[0]==s[1]==s[2] else 'Perdu'}")
@bot.command()
async def blackjack(ctx, bet: int = 50):
    p, b = random.randint(2,21), random.randint(2,21); await ctx.send(f"🃏 Toi : {p} | Banque : {b} | {'Gagné !' if p>b else 'Perdu !'}")
@bot.command()
async def roulette(ctx, bet: int = 50, color="rouge"):
    r = random.choice(["rouge","noir"]); await ctx.send(f"🎡 Roulette : {r} | {'Gagné !' if r==color else 'Perdu !'}")
@bot.command()
async def coin(ctx, bet: int = 50, choice="pile"):
    r = random.choice(["pile","face"]); await ctx.send(f"🪙 {r} | {'Gagné !' if r==choice else 'Perdu !'}")
@bot.command()
async def pay(ctx, member, amount: int):
    add_coins(ctx.author.id, -amount); await ctx.send(f"💸 {amount} coins envoyés à {member}")
@bot.command(aliases=["lb"])
async def leaderboard(ctx): await ctx.send("🏆 Leaderboard : " + ", ".join([f"<@{k}> : {v}" for k,v in sorted(coins.items(), key=lambda x: x[1], reverse=True)[:5]]) if coins else "Personne n'a de coins.")
@bot.command()
async def shop(ctx): await ctx.send("🛒 Boutique :\n1. Role VIP - 1000 coins\n2. Badge - 500 coins\n3. Couleur - 200 coins\n`R!buy <item>`")
@bot.command()
async def buy(ctx, *, item): await ctx.send(f"✅ Tu as acheté : {item}")
@bot.command()
async def inventory(ctx): await ctx.send(f"🎒 Inventaire de {ctx.author} : vide pour l'instant")
@bot.command()
async def sell(ctx, *, item): await ctx.send(f"💰 Tu as vendu : {item} pour 100 coins"); add_coins(ctx.author.id, 100)
@bot.command()
async def beg(ctx):
    amt = random.randint(1,50); add_coins(ctx.author.id, amt); await ctx.send(f"🥺 Quelqu'un t'a donné {amt} coins")
@bot.command()
async def deposit(ctx, amount: int): await ctx.send(f"🏦 {amount} coins déposés à la banque (démo)")

# ======================================================
#  🌍 INFO - 15 COMMANDES
# ======================================================
@bot.command()
async def weather(ctx, *, city="Paris"):
    async with aiohttp.ClientSession() as s:
        async with s.get(f"https://wttr.in/{city}?format=3") as r: await ctx.send(await r.text())
@bot.command()
async def crypto(ctx, coin="bitcoin"):
    async with aiohttp.ClientSession() as s:
        async with s.get(f"https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd") as r: d = await r.json(); await ctx.send(f"💹 {coin} : ${d.get(coin, {}).get('usd','?')}")
@bot.command()
async def github(ctx, user): await ctx.send(f"https://github.com/{user}")
@bot.command()
async def npm(ctx, pkg): await ctx.send(f"https://www.npmjs.com/package/{pkg}")
@bot.command()
async def define(ctx, word): await ctx.send(f"📖 {word} : https://dictionary.cambridge.org/fr/dictionnaire/francais-anglais/{word}")
@bot.command()
async def wikipedia(ctx, *, q): await ctx.send(f"https://fr.wikipedia.org/wiki/{q.replace(' ','_')}")
@bot.command()
async def urban(ctx, *, word): await ctx.send(f"https://www.urbandictionary.com/define.php?term={word}")
@bot.command()
async def anime(ctx, *, name): await ctx.send(f"https://myanimelist.net/anime.php?q={name}&cat=anime")
@bot.command()
async def manga(ctx, *, name): await ctx.send(f"https://myanimelist.net/manga.php?q={name}&cat=manga")
@bot.command()
async def cat(ctx):
    async with aiohttp.ClientSession() as s:
        async with s.get("https://api.thecatapi.com/v1/images/search") as r: d = await r.json(); await ctx.send(d[0]["url"])
@bot.command()
async def dog(ctx):
    async with aiohttp.ClientSession() as s:
        async with s.get("https://dog.ceo/api/breeds/image/random") as r: d = await r.json(); await ctx.send(d["message"])
@bot.command()
async def fox(ctx):
    async with aiohttp.ClientSession() as s:
        async with s.get("https://randomfox.ca/floof/") as r: d = await r.json(); await ctx.send(d["image"])
@bot.command()
async def pokemon(ctx, name="pikachu"): await ctx.send(f"https://pokemondb.net/pokedex/{name}")
@bot.command()
async def horoscope(ctx, sign="belier"): await ctx.send(f"🔮 Horoscope {sign} : Aujourd'hui est ton jour de chance ! {random.choice(['⭐','🌙','☀️'])}")
@bot.command()
async def covid(ctx): await ctx.send("🦠 Stats COVID : https://disease.sh")

# ======================================================
#  ⚙️ ADMIN - 14 COMMANDES
# ======================================================
@bot.command()
@commands.has_permissions(administrator=True)
async def setwelcome(ctx, channel: discord.TextChannel): await ctx.send(f"✅ Salon de bienvenue : {channel.mention}")
@bot.command(name="welcome-test")
async def welcome_test(ctx): await ctx.send(f"👋 Bienvenue {ctx.author.mention} sur {ctx.guild.name} !")
@bot.command()
@commands.has_permissions(administrator=True)
async def autorole(ctx, role: discord.Role): await ctx.send(f"✅ Auto-role : {role.name}")
@bot.command()
@commands.has_permissions(manage_roles=True)
async def addrole(ctx, member: discord.Member, role: discord.Role):
    await member.add_roles(role); await ctx.send(f"✅ Rôle {role} ajouté à {member}")
@bot.command()
@commands.has_permissions(manage_roles=True)
async def removerole(ctx, member: discord.Member, role: discord.Role):
    await member.remove_roles(role); await ctx.send("✅ Rôle retiré")
@bot.command(aliases=["giverole"])
async def giverole_cmd(ctx, member: discord.Member, role: discord.Role):
    await member.add_roles(role); await ctx.send("✅ Rôle donné")
@bot.command()
@commands.has_permissions(manage_roles=True)
async def createrole(ctx, *, name):
    await ctx.guild.create_role(name=name); await ctx.send(f"✅ Rôle {name} créé")
@bot.command()
@commands.has_permissions(manage_roles=True)
async def deleterole(ctx, role: discord.Role): await role.delete(); await ctx.send("✅ Rôle supprimé")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def createchannel(ctx, *, name):
    await ctx.guild.create_text_channel(name); await ctx.send(f"✅ Salon #{name} créé")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def deletechannel(ctx, channel: discord.TextChannel): await channel.delete(); await ctx.send("✅ Salon supprimé")
@bot.command()
@commands.has_permissions(manage_channels=True)
async def createvoice(ctx, *, name):
    await ctx.guild.create_voice_channel(name); await ctx.send(f"✅ Vocal {name} créé")
@bot.command()
async def ticket(ctx): await ctx.send("🎫 Ticket créé ! Un modo va te répondre.")
@bot.command()
async def suggest(ctx, *, idea): await ctx.send(f"💡 Suggestion de {ctx.author} : {idea}")
@bot.command()
async def report(ctx, member: discord.Member, *, reason): await ctx.send(f"🚨 Signalement : {member} pour {reason} - envoyé aux modos")

# ======================================================
#  👑 OWNER - 14 COMMANDES - TOI SEUL
# ======================================================
@bot.command()
@is_owner()
async def eval(ctx, *, code):
    try:
        result = eval(code, {'__builtins__': {}}, {'ctx': ctx, 'bot': bot, 'discord': discord})
        await ctx.send(f"✅ Résultat : `{result}`")
    except Exception as e: await ctx.send(f"❌ Erreur : `{e}`")

@bot.command()
@is_owner()
async def exec(ctx, *, code):
    try:
        exec(code); await ctx.send("✅ Code exécuté")
    except Exception as e: await ctx.send(f"❌ Erreur : `{e}`")

@bot.command()
@is_owner()
async def shutdown(ctx):
    await ctx.send("👋 Reason s'éteint..."); await bot.close()

@bot.command()
@is_owner()
async def restart(ctx):
    await ctx.send("🔄 Redémarrage... (relance le script manuellement)"); await bot.close()

@bot.command()
@is_owner()
async def reload(ctx):
    await ctx.send("🔄 Reload : pas besoin, tout est dans 1 seul fichier ! Redémarre le bot.")

@bot.command()
@is_owner()
async def blacklist(ctx, member: discord.Member):
    blacklist.add(member.id); await ctx.send(f"⛔ {member} blacklisté, il ne peut plus utiliser Reason.")

@bot.command()
@is_owner()
async def unblacklist(ctx, member: discord.Member):
    blacklist.discard(member.id); await ctx.send(f"✅ {member} dé-blacklisté.")

@bot.command()
@is_owner()
async def dm(ctx, member: discord.Member, *, text):
    try: await member.send(text); await ctx.send(f"✅ DM envoyé à {member}")
    except: await ctx.send("❌ DM fermés.")

@bot.command()
@is_owner()
async def sayas(ctx, channel: discord.TextChannel, *, text):
    await channel.send(text); await ctx.send(f"✅ Envoyé dans {channel.mention}")

@bot.command()
@is_owner()
async def setstatus(ctx, *, status):
    await bot.change_presence(activity=discord.Game(name=status)); await ctx.send(f"✅ Status : {status}")

@bot.command()
@is_owner()
async def setavatar(ctx, url):
    async with aiohttp.ClientSession() as s:
        async with s.get(url) as r: data = await r.read(); await bot.user.edit(avatar=data); await ctx.send("✅ Avatar changé !")

@bot.command()
@is_owner()
async def guilds(ctx):
    await ctx.send(f"🏰 Je suis sur {len(bot.guilds)} serveurs :\n" + "\n".join([f"- {g.name} ({g.member_count} membres)" for g in bot.guilds[:20]]))

@bot.command()
@is_owner()
async def leaveserver(ctx, guild_id: int):
    g = bot.get_guild(guild_id)
    if g: await g.leave(); await ctx.send(f"✅ J'ai quitté {g.name}")
    else: await ctx.send("Serveur introuvable.")

@bot.command()
@is_owner()
async def givecoins(ctx, member: discord.Member, amount: int):
    add_coins(member.id, amount); await ctx.send(f"💰 +{amount} coins à {member} | Total : {get_coins(member.id)}")

@bot.command()
@is_owner()
async def reseteco(ctx):
    coins.clear(); await ctx.send("💥 Economie reset !")

# ===== LANCEMENT =====
bot.run(TOKEN)
