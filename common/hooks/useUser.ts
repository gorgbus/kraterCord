import { useMutation, useQueryClient } from "react-query";
import { updateUserApi } from "../api";
import { useSocket } from "../store/socket";
import { useUserStore } from "../store/user";
import { Channel, Member, updatedPropertiesType, User } from "../types";

const useUser = () => {
    const queryClient = useQueryClient();
    const userId = useUserStore(state => state.user.id);
    const updateUserStore = useUserStore(state => state.updateUser);
    const updateMemberUser = useUserStore(state => state.updateMemberUser);
    const friends = useUserStore(state => state.user.friends);
    const socket = useSocket(state => state.socket);

    type updateUserType = { 
        voiceChannelId?: string;
        guildId?: string;
        guildsIds?: string[];
        userId: string;
        update: updatedPropertiesType<User>
    }

    const onMutateUser = async (updateData: updateUserType) => {
            await queryClient.cancelQueries(["members"]);

            const cache = queryClient.getQueriesData<Member[]>(["members"]);

            if (!cache) return;

            const newCache = (updateData.guildsIds) ? cache.filter(([key]) => updateData.guildsIds?.some(g => g == key[1])) : cache;

            for (const [, members] of newCache) {
                const index = members.findIndex(member => member.userId === updateData.userId);

                if (index === -1) return { cache };

                members[index] = { ...members[index], user: { ...members[index].user, ...updateData.update } as User };
            }

            const guildIds = newCache.map(([key]) => key[1]);

            queryClient.setQueryData(["members"], newCache);

            if (!updateData.voiceChannelId) return { cache, guildIds };

            await queryClient.cancelQueries(["channels", updateData.guildId]);

            const voiceCache = queryClient.getQueryData<Channel[]>(["channels", updateData.guildId]);

            if (!voiceCache) return { cache, guildIds };

            const newVoiceCache = voiceCache;

            const voiceIndex = newVoiceCache.findIndex(ch => ch.id === updateData.voiceChannelId);

            if (voiceIndex === -1) return { cache, voiceCache, guildId: updateData.guildId, guildIds };

            newVoiceCache[voiceIndex].members = newVoiceCache[voiceIndex].members.map(member => member.userId === updateData.userId ? { ...member, user: { ...member.user, ...updateData.update } as User } : member);

            queryClient.setQueryData(["channels", updateData.guildId], newVoiceCache);

            return { cache, voiceCache, guildId: updateData.guildId, guildIds };
        }

    const { mutate: updateUserSidebars } = useMutation(updateUserApi, {
        onMutate: onMutateUser,
        onError: (_error, _data, context: any) => {
            if (context?.cache) queryClient.setQueryData(["members"], context.cache);
            if (context?.voiceCache) queryClient.setQueryData(["channels", context.guildId], context.voiceCache);
        },
        onSettled: (data, _error, variables, context) => {
            queryClient.invalidateQueries(["members"]);
            if (context?.guildId) queryClient.invalidateQueries(["channels", context.guildId]);

            if (!data) return;

            socket?.emit("update", "user", {
                update: data,
                voiceChannelId: variables.voiceChannelId,
                userId: variables.userId,
                guildId: variables.guildId,
                guildIds: context?.guildIds
            });

            if (friends.length < 1) return;

            const friendIds = friends.map(friend => friend.id);

            socket?.emit("update", "friend", {
                update: data,
                friendIds,
            });
        }
    });

    const { mutate: updateUserSocket } = useMutation(async (updateData: updateUserType) => updateData, {
        onMutate: onMutateUser,
        onError: (_error, _data, context: any) => {
            if (context?.cache) queryClient.setQueryData(["members"], context.cache);
            if (context?.voiceCache) queryClient.setQueryData(["channels", context.guildId], context.voiceCache);
        },
        onSettled: (_data, _error, _var, context) => {
            queryClient.invalidateQueries(["members"]);
            if (context?.guildId) queryClient.invalidateQueries(["channels", context.guildId]);
        }
    });

    const updateUser = (update: updatedPropertiesType<User>, voiceChannelId?: string, guildId?: string) => {
        const checkedProperties: any = update;

        for (const property in checkedProperties) {
            if (checkedProperties[property] === undefined) delete checkedProperties[property];
        }

        updateUserSidebars({
            userId,
            update: checkedProperties,
            guildId,
            voiceChannelId
        });

        updateUserStore(checkedProperties);
        updateMemberUser(checkedProperties);
    }

    return { updateUser, updateUserSocket }
}

export default useUser;