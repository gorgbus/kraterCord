import { Profile, Strategy } from "passport-discord";
import passport from "passport";
import { VerifyCallback } from "passport-oauth2";
import User from "../database/schemas/User";
import Member from "../database/schemas/Member";
import { encrypt } from "../utils/crypto";
import Notif from "../database/schemas/Notif";

passport.serializeUser((user: any, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        return user ? done(null, user) : done(null, null);
    } catch (err) {
        console.log(err);
        return done(err, null);
    }
});

passport.use(new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_REDIRECT_URL,
        scope: ["identify", "email", "guilds", "guilds.members.read"],
    }, async (
        accessToken: string, 
        refreshToken: string, 
        profile: Profile, 
        done: VerifyCallback
    ) => {
        try {
            const encryptedAccessToken = encrypt(accessToken);
            const encryptedRefreshToken = encrypt(refreshToken);
            const { id: discordId, username } = profile;
            let { avatar } = profile;
            const existingUser = await User.findOneAndUpdate({ discordId }, { accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken }, { new: true });
            const member = await Member.findOne({ discordId });

            if (!member) {
                (avatar) ? avatar = `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png` : avatar = "https://cdn.discordapp.com/attachments/805393975900110852/950026779484094494/ano-ne.gif";

                const newMember = new Member({ discordId, username, avatar, hash: discordId.slice(discordId.length - 4, discordId.length), friends: [], friendRequests: [], status: "offline" });
                const savedMember = await newMember.save();

                const memberNotifs = new Notif({ user: savedMember._id, notfis: [] });
                await memberNotifs.save();
            }

            if (existingUser) return done(null, existingUser);

            const newUser = new User({ discordId, accessToken: encryptedAccessToken, refreshToken: encryptedRefreshToken });
            const savedUser = await newUser.save();
            return done(null, savedUser);
        } catch(err) {
            console.log(err);
            return done(err as any, undefined);
        }
    }
));