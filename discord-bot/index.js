const { Client, GatewayIntentBits, Events } = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const apiUrl = process.env.SUPABASE_FUNCTION_URL || "https://ggzlafvkjzoctcuyixur.supabase.co/functions/v1/francerpv3-api";
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!token) {
  console.error("❌ Variable DISCORD_TOKEN absente. Ajoute le jeton du bot dans les variables d'environnement de l'hébergeur.");
  process.exit(1);
}
if (!publishableKey) {
  console.error("❌ Variable SUPABASE_PUBLISHABLE_KEY absente.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

let activeGuildId = guildId || null;
let syncing = false;

async function sendToDashboard(payload) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": publishableKey,
      "Authorization": `Bot ${token}`
    },
    body: JSON.stringify({
      action: "discord-sync",
      guild_id: activeGuildId,
      ...payload
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `API HTTP ${response.status}`);
  }
  return result;
}

async function syncStats(guild) {
  if (!guild || syncing) return;
  syncing = true;
  try {
    const result = await sendToDashboard({
      stats: {
        member_count: guild.memberCount,
        boost_count: guild.premiumSubscriptionCount
      }
    });
    console.log(`📊 Stats synchronisées : ${result.stats?.member_count ?? "—"} membres`);
  } catch (error) {
    console.error("❌ Synchronisation des statistiques impossible :", error.message);
  } finally {
    syncing = false;
  }
}

async function logEvent(guild, type, summary) {
  if (!guild || (activeGuildId && guild.id !== activeGuildId)) return;
  try {
    await sendToDashboard({ event: { type, summary } });
    console.log(`🧾 Log envoyé : ${type}`);
  } catch (error) {
    console.error("❌ Envoi du log impossible :", error.message);
  }
}

client.once(Events.ClientReady, async readyClient => {
  console.log(`✅ Bot connecté : ${readyClient.user.tag}`);
  if (!activeGuildId) activeGuildId = readyClient.guilds.cache.first()?.id || null;
  if (!activeGuildId) {
    console.error("❌ Le bot n'est sur aucun serveur. Ajoute-le à FRANCE RP et configure GUILD_ID.");
    return;
  }

  try {
    const guild = await readyClient.guilds.fetch(activeGuildId);
    console.log(`🔗 Serveur suivi : ${guild.name} (${guild.id})`);
    await syncStats(guild);
    setInterval(async () => {
      try {
        const refreshedGuild = await readyClient.guilds.fetch(activeGuildId);
        await syncStats(refreshedGuild);
      } catch (error) {
        console.error("Erreur pendant la mise à jour planifiée :", error.message);
      }
    }, 60_000);
  } catch (error) {
    console.error("❌ Impossible d'accéder au serveur configuré :", error.message);
  }
});

client.on(Events.GuildMemberAdd, async member => {
  if (activeGuildId && member.guild.id !== activeGuildId) return;
  await logEvent(member.guild, "member_join", `${member.user.tag} a rejoint le serveur`);
  await syncStats(member.guild);
});

client.on(Events.GuildMemberRemove, async member => {
  if (activeGuildId && member.guild.id !== activeGuildId) return;
  await logEvent(member.guild, "member_leave", `${member.user.tag} a quitté le serveur`);
  await syncStats(member.guild);
});

client.on(Events.MessageDelete, async message => {
  if (!message.guild || message.author?.bot) return;
  const channel = message.channel?.name || "salon inconnu";
  await logEvent(message.guild, "message_delete", `Un message a été supprimé dans #${channel}`);
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const channel = newMessage.channel?.name || "salon inconnu";
  await logEvent(newMessage.guild, "message_edit", `Un message a été modifié dans #${channel}`);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (activeGuildId && newMember.guild.id !== activeGuildId) return;
  const before = oldMember.roles.cache;
  const after = newMember.roles.cache;
  const added = after.filter(role => !before.has(role.id));
  const removed = before.filter(role => !after.has(role.id));
  if (added.size || removed.size) {
    const changes = [];
    if (added.size) changes.push(`rôle(s) ajouté(s) : ${added.map(role => role.name).join(", ")}`);
    if (removed.size) changes.push(`rôle(s) retiré(s) : ${removed.map(role => role.name).join(", ")}`);
    await logEvent(newMember.guild, "role_update", `Rôles de ${newMember.user.tag} modifiés (${changes.join("; ")})`);
  }
  if (oldMember.premiumSince !== newMember.premiumSince) {
    await syncStats(newMember.guild);
  }
});

client.on(Events.Error, error => console.error("Erreur Discord :", error));
process.on("unhandledRejection", error => console.error("Promesse rejetée :", error));

client.login(token);
