import { Profile, Strategy } from "passport-discord";
import passport from "passport";
import { VerifyCallback } from "passport-oauth2";

passport.use(new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_REDIRECT_URL,
        passReqToCallback: true,
        scope: ["identify", "email", "guilds", "guilds.members.read"],
    }, async (
        req: any,
        accessToken: string, 
        refreshToken: string, 
        profile: Profile, 
        done: VerifyCallback,
    ) => {
        try {
            const { id: discordId, username } = profile;
            let { avatar } = profile;

            req._user = {
                token: accessToken,
                discordId,
                avatar,
                username,
                redir: req.query.state
            };

            return done(null, { id: discordId });
        } catch(err) {
            console.error(err);
            return done(err as any, undefined);
        }
    }
));