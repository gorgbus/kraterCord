import { useQueryClient, useMutation } from "react-query";
import { updateMemberApi, updateVoiceState } from "../api";
import { useSocket } from "../store/socket";
import { useUserStore } from "../store/user";
import { Channel, Member, updatedPropertiesType } from "../types";

const useMember = () => {
    const updateMemberStore = useUserStore(state => state.updateMember);
    const socket = useSocket(state => state.socket);

    const queryClient = useQueryClient();

    const { mutate: updateVoice } = useMutation(updateVoiceState, {
        onMutate: async ({ deafen, muted, guildId, channelId, memberId }) => {
            await queryClient.cancelQueries(["channels", guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", guildId]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(ch => ch.id === channelId);

            if (index === -1) return { cache };

            newCache[index].members = newCache[index].members.map(member => member.id === memberId ? { ...member, deafen, muted } : member);

            queryClient.setQueryData(["channels", guildId], newCache);

            // socket?.emit("update_voice_state", voiceGuild, voice, userId, muted, deafen);

            return { cache }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(["channels", data.guildId]);
        }
    });

    const { mutate: updateMemberVoice } = useMutation(async (channelData: {
        guildId: string;
        channelId: string;
        memberId: string;
        muted: boolean;
        deafen: boolean;
    }) => channelData, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(["channels", channelData.guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.guildId]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(ch => ch.id === channelData.channelId);

            if (index === -1) return { cache };

            newCache[index].members = newCache[index].members.map(member => member.id === channelData.memberId ? { ...member, deafen: channelData.deafen, muted: channelData.muted } : member);

            queryClient.setQueryData(["channels", channelData.guildId], newCache);

            return { cache }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(["channels", data.guildId]);
        }
    });

    type updateMemberType = {
        voiceChannelId?: string;
        channelId?: string;
        memberId: string;
        guildId: string;
        update: updatedPropertiesType<Member>
    }

    const onMutateMember = async (updateData: updateMemberType) => {
            await queryClient.cancelQueries(["members", updateData.guildId]);

            const cache = queryClient.getQueryData<Member[]>(["members", updateData.guildId]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(member => member.id === updateData.memberId);

            if (index === -1) return { cache };

            newCache[index] = { ...newCache[index], ...updateData.update }

            queryClient.setQueryData(["members", updateData.guildId], newCache);

            if (!updateData.voiceChannelId) return { cache };

            await queryClient.cancelQueries(["channels", updateData.guildId]);

            const voiceCache = queryClient.getQueryData<Channel[]>(["channels", updateData.guildId]);

            if (!voiceCache) return { cache };

            const newVoiceCache = voiceCache;

            const voiceIndex = newVoiceCache.findIndex(ch => ch.id === updateData.voiceChannelId);

            if (voiceIndex === -1) return { cache, voiceCache };

            newVoiceCache[voiceIndex].members = newVoiceCache[voiceIndex].members.map(member => member.id === updateData.memberId ? { ...member, ...updateData.update } : member);

            queryClient.setQueryData(["channels", updateData.guildId], newVoiceCache);

            return { cache, voiceCache };
        }

    const { mutate: updateMemberSidebars } = useMutation(updateMemberApi, {
        onMutate: onMutateMember,
        onError: (_error, data, context) => {
            if (context?.cache) queryClient.setQueryData(["members", data.guildId], context.cache);
            if (context?.voiceCache) queryClient.setQueryData(["channels", data.guildId], context.voiceCache);
        },
        onSettled: (data) => {
            if (data) {
                queryClient.invalidateQueries(["members", data.member.guildId]);
                queryClient.invalidateQueries(["channel", data.channelId]);
                queryClient.invalidateQueries(["channels", data.member.guildId]);
            }
        }
    });

    const { mutate: updateMemberSocket } = useMutation(async (updateData: updateMemberType) => updateData, {
        onMutate: onMutateMember,
        onError: (_error, data, context) => {
            if (context?.cache) queryClient.setQueryData(["members", data.guildId], context.cache);
            if (context?.voiceCache) queryClient.setQueryData(["channels", data.guildId], context.voiceCache);
        },
        onSettled: (data, _err, variables) => {
            if (data) {
                queryClient.invalidateQueries(["members", data.guildId]);
                queryClient.invalidateQueries(["channels", data.guildId]);
            }

            socket?.emit("update", "member", variables);
        }
    });

    const updateMember = (guildId: string, memberId: string, updatedProperties: updatedPropertiesType<Member>, channelId?: string, voiceChannelId?: string) => {
        const checkedProperties: any = updatedProperties;

        for (const property in checkedProperties) {
            if (checkedProperties[property] === undefined) delete checkedProperties[property];
        }
        
        updateMemberSidebars({
            memberId,
            update: checkedProperties,
            channelId,
            guildId,
            voiceChannelId
        });

        updateMemberStore(memberId, checkedProperties);
    }

    return { updateVoice, updateMemberVoice, updateMember, updateMemberSocket };
}

export default useMember;