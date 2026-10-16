# Bot de synchronisation FRANCE RP

Ce bot alimente le tableau de bord FRANCE RP avec les statistiques Discord et des résumés de logs publics. Il n'enregistre pas le contenu des messages supprimés ou modifiés.

## Variables d'environnement

Configure ces variables dans l'hébergeur du bot. **Ne mets jamais le jeton dans GitHub ni dans le site web.**

- `DISCORD_TOKEN` : jeton du bot créé dans le Discord Developer Portal.
- `GUILD_ID` : identifiant numérique du serveur FRANCE RP (active le mode développeur Discord, clic droit sur le serveur > Copier l'identifiant).
- `SUPABASE_PUBLISHABLE_KEY` : clé publique Supabase du projet, fournie pour l'appel de l'API.
- `SUPABASE_FUNCTION_URL` : facultatif ; par défaut `https://ggzlafvkjzoctcuyixur.supabase.co/functions/v1/francerpv3-api`.

## Installation

1. Crée un bot dans le Discord Developer Portal ou utilise le bot prévu pour FRANCE RP.
2. Dans **Bot**, active l'intention privilégiée **Server Members Intent** pour les arrivées et départs.
3. Invite le bot dans le serveur avec les permissions de lecture des salons et d'accès aux messages. Aucun droit Administrateur n'est nécessaire.
4. Déploie le contenu du dossier `discord-bot` sur un hébergeur Node.js compatible.
5. Configure les variables d'environnement ci-dessus et démarre avec `npm start`.
6. Ouvre le site : les stats se synchronisent à la connexion du bot puis environ chaque minute.

## Événements

Le bot envoie des résumés pour les arrivées/départs, suppressions/modifications de messages et changements de rôles. Il n'envoie pas le texte des messages, les MP ou les adresses IP.

## Limite

Les événements réels ne seront enregistrés que lorsque le bot sera démarré sur un hébergeur et aura accès au serveur FRANCE RP. Le site peut afficher les statistiques publiques de l'invitation même avant cette étape, si Discord rend ces compteurs disponibles.
