import { Profile, Strategy } from "passport-discord";
import passport from "passport";
import { VerifyCallback } from "passport-oauth2";
import User from "../database/schemas/User";

// passport.serializeUser((user: any, done) => {
//     return done(null, user.id);
// });

// passport.deserializeUser(async (id: string, done) => {
//     try {
//         const user = await User.findById(id);
//         return user ? done(null, user) : done(null, null);
//     } catch (err) {
//         console.log(err);
//         return done(err, null);
//     }
// });

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
        done: VerifyCallback
    ) => {
        try {
            const { id: discordId, username } = profile;
            let { avatar } = profile;

            req._user = {
                token: accessToken,
                discordId,
                avatar,
                username,
            };

            return done(null, { id: discordId });
        } catch(err) {
            console.log(err);
            return done(err as any, undefined);
        }
    }
));