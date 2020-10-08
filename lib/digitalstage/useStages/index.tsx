import React, {useCallback, useEffect, useState} from "react";
import * as Server from "./../common/model.server";
import {useDevices} from "../useDevices";
import {ClientStageEvents, ServerStageEvents} from "../common/events";
import {useRequest} from "../../useRequest";
import {Client} from "../common/model.client";
import {GroupId, StageId, StageMemberId} from "../common/model.common";
import {
    AddGroupPayload,
    AddStagePayload,
    ChangeGroupPayload,
    ChangeStageMemberAudioProducerPayload,
    ChangeStageMemberOvTrackPayload,
    ChangeStageMemberPayload,
    ChangeStagePayload,
    JoinStagePayload,
    SetCustomGroupPayload,
    SetCustomStageMemberAudioProducerPayload,
    SetCustomStageMemberOvTrackPayload,
    SetCustomStageMemberPayload
} from "../common/payloads";
import omit from "lodash.omit";
import {ThreeDimensionAudioProperties} from "../common/model.utils";
import {StageMemberAudioProducerId, StageMemberOvTrackId} from "./../common/model.server";

export type Users = { [id: string]: Server.User };
export type Groups = { [id: string]: Server.Group };
export type CustomGroups = { [groupId: string]: Server.CustomGroup };
export type CustomStageMembers = { [stageMemberId: string]: Server.CustomStageMember };
export type CustomStageMemberAudioProducers = { [stageMemberAudioProducerId: string]: Server.CustomStageMemberAudioProducer };
export type CustomStageMemberOvTracks = { [stageMemberOvTrackId: string]: Server.CustomStageMemberOvTrack };

export interface StagesProps {
    // States
    stageId?: {
        stageId: Server.StageId;
        groupId: Server.GroupId;
    }
    stage?: Client.Stage;
    availableStages: Client.Stage[];
    groups: Server.Group[];
    customGroups: CustomGroups;
    users: Users;
    stageMembers: Server.StageMember[];
    customStageMembers: CustomStageMembers;
    videoProducers: Server.StageMemberVideoProducer[];
    audioProducers: Server.StageMemberAudioProducer[];
    customAudioProducers: CustomStageMemberAudioProducers;
    ovTracks: Server.StageMemberOvTrack[];
    customOvTracks: CustomStageMemberOvTracks;

    // Methods
    createStage(name: string, password: string | null, width?: number, length?: number, height?: number, reflection?: number, absorption?: number);

    updateStage(id: StageId, stage: Partial<Server.Stage>);

    joinStage(stageId: StageId, groupId: GroupId, password: string | null): Promise<void>;

    leaveStage();

    leaveStageForGood(id: StageId);

    removeStage(id: StageId);

    createGroup(stageId: StageId, name: string);

    updateGroup(id: GroupId, group: Partial<Server.Group>);

    removeGroup(id: GroupId);

    updateStageMember(id: StageMemberId, update: Partial<{
        isDirector: boolean;
    } & ThreeDimensionAudioProperties>);

    setCustomGroup(groupId: GroupId, volume: number);

    setCustomStageMember(id: StageMemberId, update: Partial<ThreeDimensionAudioProperties>);

    updateStageMemberAudio(id: StageMemberAudioProducerId, update: Partial<ThreeDimensionAudioProperties>);

    setCustomStageMemberAudio(stageMemberAudioProducerId: StageMemberAudioProducerId, update: Partial<ThreeDimensionAudioProperties>);

    updateStageMemberTrack(id: StageMemberOvTrackId, update: Partial<ThreeDimensionAudioProperties>);

    setCustomStageMemberTrack(stageMemberOvTrackId: StageMemberOvTrackId, update: Partial<ThreeDimensionAudioProperties>);
}

const StagesContext = React.createContext<StagesProps>(undefined);

export const useStages = (): StagesProps => React.useContext<StagesProps>(StagesContext);

export const StagesContextConsumer = StagesContext.Consumer;

export const StagesContextProvider = (props: {
    children: React.ReactNode
}) => {
    const {socket, user} = useDevices();
    const {setRequest} = useRequest();

    // Data
    const [users, setUsers] = useState<Users>({});
    const [availableStages, setAvailableStages] = useState<Client.Stage[]>([]);

    // Single stage data
    const [stage, setStage] = useState<Client.Stage>();
    const [stageId, setStageId] = useState<{ stageId: Server.StageId, groupId: Server.GroupId }>();
    const [groups, setGroups] = useState<Server.Group[]>([]);
    const [stageMembers, setStageMembers] = useState<Server.StageMember[]>([]);
    const [audioProducers, setAudioProducers] = useState<Server.StageMemberAudioProducer[]>([]);
    const [videoProducers, setVideoProducers] = useState<Server.StageMemberVideoProducer[]>([]);
    const [ovTracks, setOvTracks] = useState<Server.StageMemberOvTrack[]>([]);

    const [customGroups, setCustomGroups] = useState<CustomGroups>({});
    const [customStageMembers, setCustomStageMembers] = useState<CustomStageMembers>({});
    const [customAudioProducers, setCustomAudioProducers] = useState<CustomStageMemberAudioProducers>({});
    const [customOvTracks, setCustomOvTracks] = useState<CustomStageMemberOvTracks>({});


    const registerSocketHandlers = useCallback(() => {
        console.log("[useStages] Registering socket handlers");
        socket.on(ServerStageEvents.STAGE_JOINED, (payload: Server.InitialStagePackage) => {
            if (payload.stage) {
                setAvailableStages(prevState => [...prevState, {
                    ...payload.stage,
                    isAdmin: payload.stage.admins.find(admin => user._id === admin) !== undefined
                }]);
            }
            if (payload.groups) {
                setGroups(prevState => [...prevState, ...payload.groups]);
            }
            setUsers(payload.users.reduce<Users>((prev, cur) => {
                prev[cur._id] = cur;
                return prev
            }, {}));
            setCustomGroups(payload.customGroups.reduce<CustomGroups>((prev, cur) => {
                prev[cur._id] = cur;
                return prev
            }, {}));
            setCustomStageMembers(payload.customStageMembers.reduce<CustomStageMembers>((prev, cur) => {
                prev[cur._id] = cur;
                return prev
            }, {}));
            setCustomAudioProducers(payload.customAudioProducers.reduce<CustomStageMemberAudioProducers>((prev, cur) => {
                prev[cur._id] = cur;
                return prev
            }, {}));
            setCustomOvTracks(payload.customOvTracks.reduce<CustomStageMemberOvTracks>((prev, cur) => {
                prev[cur._id] = cur;
                return prev
            }, {}));
            setStageMembers(payload.stageMembers);
            setVideoProducers(payload.videoProducers);
            setAudioProducers(payload.audioProducers);
            setOvTracks(payload.ovTracks);
            setStageId({
                stageId: payload.stageId,
                groupId: payload.groupId
            });
        });

        socket.on(ServerStageEvents.USER_ADDED, (payload: Server.User) => {
            setUsers(prevState => ({...prevState, [payload._id]: payload}))
        });
        socket.on(ServerStageEvents.USER_CHANGED, (payload: Server.User) => {
            setUsers(prevState => ({...prevState, [payload._id]: payload}));
        });
        socket.on(ServerStageEvents.USER_REMOVED, (payload: Server.UserId) => {
            setUsers(prevState => omit(prevState, payload));
        });

        socket.on(ServerStageEvents.STAGE_ADDED, (payload: Server.Stage) => {
            setAvailableStages(prevState => [...prevState, {
                ...payload,
                isAdmin: payload.admins.find(admin => user._id === admin) !== undefined
            }])
        });
        socket.on(ServerStageEvents.STAGE_CHANGED, (payload: Server.Stage) => {
            setAvailableStages(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload,
                isAdmin: payload.admins ? payload.admins.find(admin => user._id === admin) !== undefined : el.isAdmin
            } : el));
        });
        socket.on(ServerStageEvents.STAGE_REMOVED, (payload: Server.UserId) => {
            setAvailableStages(prevState => prevState.filter(stage => stage._id !== payload));
        });

        socket.on(ServerStageEvents.GROUP_ADDED, (payload: Server.Group) => {
            setGroups(prevState => [...prevState, payload])
        });
        socket.on(ServerStageEvents.GROUP_CHANGED, (payload: Server.Group) => {
            setGroups(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload
            } : el));
        });
        socket.on(ServerStageEvents.GROUP_REMOVED, (payload: Server.GroupId) => {
            setGroups(prevState => prevState.filter(el => el._id !== payload));
        });

        socket.on(ServerStageEvents.CUSTOM_GROUP_ADDED, (payload: Server.CustomGroup) => {
            setCustomGroups(prevState => ({...prevState, [payload.groupId]: payload}))
        });
        socket.on(ServerStageEvents.CUSTOM_GROUP_CHANGED, (payload: Server.CustomGroup) => {
            setCustomGroups(prevState => ({
                ...prevState,
                [payload.groupId]: {...prevState[payload.groupId], ...payload}
            }));
        });
        socket.on(ServerStageEvents.CUSTOM_GROUP_REMOVED, (payload: Server.CustomGroupId) => {
            setCustomGroups(prevState => {
                const o = Object.values(prevState).find(s => s._id === payload);
                return omit(prevState, o.groupId);
            });
        });

        socket.on(ServerStageEvents.STAGE_MEMBER_ADDED, (payload: Server.StageMember) => {
            setStageMembers(prevState => [...prevState, payload])
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_CHANGED, (payload: Server.StageMember) => {
            setStageMembers(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload
            } : el));
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_REMOVED, (payload: Server.StageMemberId) => {
            setStageMembers(prevState => prevState.filter(el => el._id !== payload));
        });


        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_ADDED, (payload: Server.CustomStageMember) => {
            setCustomStageMembers(prevState => ({...prevState, [payload.stageMemberId]: payload}))
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_CHANGED, (payload: Server.CustomStageMember) => {
            setCustomStageMembers(prevState => ({
                ...prevState,
                [payload._id]: {...prevState[payload.stageMemberId], ...payload}
            }));
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_REMOVED, (payload: Server.CustomStageMemberId) => {
            setCustomStageMembers(prevState => {
                const o = Object.values(prevState).find(s => s._id === payload);
                return omit(prevState, o.stageMemberId);
            });
        });

        socket.on(ServerStageEvents.STAGE_MEMBER_VIDEO_ADDED, (payload: Server.StageMemberVideoProducer) => {
            setVideoProducers(prevState => [...prevState, payload])
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_VIDEO_CHANGED, (payload: Server.StageMemberVideoProducer) => {
            setVideoProducers(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload
            } : el));
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_VIDEO_REMOVED, (payload: Server.StageMemberVideoProducerId) => {
            setVideoProducers(prevState => prevState.filter(el => el._id !== payload));
        });

        socket.on(ServerStageEvents.STAGE_MEMBER_AUDIO_ADDED, (payload: Server.StageMemberAudioProducer) => {
            setAudioProducers(prevState => [...prevState, payload])
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_AUDIO_CHANGED, (payload: Server.StageMemberAudioProducer) => {
            setAudioProducers(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload
            } : el));
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_AUDIO_REMOVED, (payload: Server.StageMemberAudioProducerId) => {
            setAudioProducers(prevState => prevState.filter(el => el._id !== payload));
        });

        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_AUDIO_ADDED, (payload: Server.CustomStageMemberAudioProducer) => {
            setCustomAudioProducers(prevState => ({...prevState, [payload.stageMemberAudioProducerId]: payload}))
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_AUDIO_CHANGED, (payload: Server.CustomStageMemberAudioProducer) => {
            setCustomAudioProducers(prevState => ({
                ...prevState,
                [payload.stageMemberAudioProducerId]: {...prevState[payload.stageMemberAudioProducerId], ...payload}
            }));
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_AUDIO_REMOVED, (payload: Server.CustomStageMemberAudioProducerId) => {
            setCustomAudioProducers(prevState => {
                const o = Object.values(prevState).find(s => s._id === payload);
                return omit(prevState, o.stageMemberAudioProducerId);
            });
        });

        socket.on(ServerStageEvents.STAGE_MEMBER_OV_ADDED, (payload: Server.StageMemberOvTrack) => {
            setOvTracks(prevState => [...prevState, payload])
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_OV_CHANGED, (payload: Server.StageMemberOvTrack) => {
            setOvTracks(prevState => prevState.map(el => el._id === payload._id ? {
                ...el,
                ...payload
            } : el));
        });
        socket.on(ServerStageEvents.STAGE_MEMBER_OV_REMOVED, (payload: Server.StageMemberOvTrackId) => {
            setOvTracks(prevState => prevState.filter(el => el._id !== payload));
        });

        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_OV_ADDED, (payload: Server.CustomStageMemberOvTrack) => {
            setCustomOvTracks(prevState => ({...prevState, [payload.stageMemberOvTrackId]: payload}))
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_OV_CHANGED, (payload: Server.CustomStageMemberOvTrack) => {
            setCustomOvTracks(prevState => ({
                ...prevState,
                [payload.stageMemberOvTrackId]: {...prevState[payload.stageMemberOvTrackId], ...payload}
            }));
        });
        socket.on(ServerStageEvents.CUSTOM_STAGE_MEMBER_OV_REMOVED, (payload: Server.CustomStageMemberOvTrackId) => {
            setCustomOvTracks(prevState => {
                const o = Object.values(prevState).find(s => s._id === payload);
                return omit(prevState, o.stageMemberOvTrackId);
            });
        });
    }, [socket, user]);

    useEffect(() => {
        if (stageId) {
            setStage(availableStages.find(stage => stage._id === stageId.stageId));
        } else {
            setStage(undefined);
        }
    }, [stageId, availableStages]);

    useEffect(() => {
        if (socket && user) {
            registerSocketHandlers();
            return () => {
                console.log("[useStages] Cleaning up")
                setUsers({});
                setAvailableStages([]);
                setGroups([]);
                setCustomGroups({});
                setStageMembers([]);
                setCustomStageMembers({});
                setAudioProducers([]);
                setVideoProducers([]);
                setOvTracks([]);
                setOvTracks([]);
            }
        }
    }, [socket, user]);

    const createStage = useCallback((name: string, password: string, width?: number, length?: number, height?: number, reflection?: number, absorption?: number) => {
        if (socket) {
            const payload: AddStagePayload = {
                name: name,
                password: password,
                width: width || 25,
                length: length || 13,
                height: height || 7.5,
                damping: reflection || 0.7,
                absorption: absorption || 0.6
            }
            socket.emit(ClientStageEvents.ADD_STAGE, payload);
        }
    }, [socket]);

    const updateStage = useCallback((id: StageId, stage: Partial<Server.Stage>) => {
        if (socket) {
            const payload: ChangeStagePayload = {
                id: id,
                update: stage
            }
            socket.emit(ClientStageEvents.CHANGE_STAGE, payload);
        }
    }, [socket]);

    const joinStage = useCallback((stageId: StageId, groupId: GroupId, password: string): Promise<void> => {
        if (socket) {
            const payload: JoinStagePayload = {
                stageId: stageId,
                groupId: groupId,
                password: password || undefined
            }
            return new Promise<void>((resolve, reject) => {
                socket.emit(ClientStageEvents.JOIN_STAGE, payload, (error) => {
                    if (!error)
                        resolve();
                    else
                        reject(error);
                });
            })
        }
    }, [socket]);

    const leaveStage = useCallback(() => {
        if (socket) {
            socket.emit(ClientStageEvents.LEAVE_STAGE);
        }
        setRequest(undefined, undefined, null);
    }, [socket]);

    const leaveStageForGood = useCallback((id: StageId) => {
        if (socket) {
            socket.emit(ClientStageEvents.LEAVE_STAGE_FOR_GOOD, id);
        }
        if (stageId && stageId.stageId === id) {
            setRequest(undefined, undefined, null);
        }
    }, [socket]);

    const removeStage = useCallback((id: StageId) => {
        if (socket) {
            socket.emit(ClientStageEvents.REMOVE_STAGE, id);
        }
    }, [socket]);

    const createGroup = useCallback((stageId: StageId, name: string) => {
        if (socket) {
            const payload: AddGroupPayload = {
                stageId: stageId,
                name: name
            }
            socket.emit(ClientStageEvents.ADD_GROUP, payload);
        }
    }, [socket]);

    const updateGroup = useCallback((id: GroupId, update: Partial<Server.Group>) => {
        if (socket) {
            const payload: ChangeGroupPayload = {
                id: id,
                update: update
            }
            socket.emit(ClientStageEvents.CHANGE_GROUP, payload);
        }
    }, [socket]);

    const removeGroup = useCallback((id: GroupId) => {
        if (socket) {
            socket.emit(ClientStageEvents.REMOVE_GROUP, id);
        }
    }, [socket]);

    const updateStageMember = useCallback((id: StageMemberId, update: Partial<{
        isDirector: boolean;
    } & ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: ChangeStageMemberPayload = {
                id: id,
                update: update
            }
            socket.emit(ClientStageEvents.CHANGE_STAGE_MEMBER, payload);
        }
    }, [socket]);

    const setCustomGroup = useCallback((groupId: GroupId, volume: number) => {
        if (socket) {
            const payload: SetCustomGroupPayload = {
                groupId: groupId,
                volume: volume
            }
            socket.emit(ClientStageEvents.SET_CUSTOM_GROUP, payload);
        }
    }, [socket]);

    const setCustomStageMember = useCallback((stageMemberId: StageMemberId, update: Partial<ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: SetCustomStageMemberPayload = {
                stageMemberId: stageMemberId,
                update: update
            }
            socket.emit(ClientStageEvents.SET_CUSTOM_STAGE_MEMBER, payload);
        }
    }, [socket]);

    const updateStageMemberAudio = useCallback((id: StageMemberAudioProducerId, update: Partial<ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: ChangeStageMemberAudioProducerPayload = {
                id: id,
                update: update
            }
            socket.emit(ClientStageEvents.CHANGE_STAGE_MEMBER_AUDIO, payload);
        }
    }, [socket]);

    const updateStageMemberTrack = useCallback((id: StageMemberOvTrackId, update: Partial<ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: ChangeStageMemberOvTrackPayload = {
                id: id,
                update: update
            }
            socket.emit(ClientStageEvents.CHANGE_STAGE_MEMBER_OV, payload);
        }
    }, [socket]);

    const setCustomStageMemberAudio = useCallback((stageMemberAudioId: StageMemberAudioProducerId, update: Partial<ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: SetCustomStageMemberAudioProducerPayload = {
                stageMemberAudioId: stageMemberAudioId,
                update: update
            }
            socket.emit(ClientStageEvents.SET_CUSTOM_STAGE_MEMBER_AUDIO, payload);
        }
    }, [socket]);


    const setCustomStageMemberTrack = useCallback((stageMemberOvTrackId: StageMemberOvTrackId, update: Partial<ThreeDimensionAudioProperties>) => {
        if (socket) {
            const payload: SetCustomStageMemberOvTrackPayload = {
                stageMemberOvTrackId: stageMemberOvTrackId,
                update: update
            }
            socket.emit(ClientStageEvents.SET_CUSTOM_STAGE_MEMBER_OV, payload);
        }
    }, [socket]);

    return (
        <StagesContext.Provider value={{
            // States
            stageId: stageId,
            stage: stage,
            availableStages: availableStages,
            groups: groups,
            customGroups: customGroups,
            users: users,
            stageMembers: stageMembers,
            customStageMembers: customStageMembers,
            audioProducers: audioProducers,
            customAudioProducers: customAudioProducers,
            videoProducers: videoProducers,
            ovTracks: ovTracks,
            customOvTracks: customOvTracks,

            // Methods
            createStage,
            joinStage,
            leaveStage,
            updateStage,
            removeStage,
            createGroup,
            updateGroup,
            removeGroup,
            updateStageMember,
            setCustomGroup: setCustomGroup,
            setCustomStageMember: setCustomStageMember,
            updateStageMemberAudio: updateStageMemberAudio,
            setCustomStageMemberAudio: setCustomStageMemberAudio,
            updateStageMemberTrack: updateStageMemberTrack,
            setCustomStageMemberTrack: setCustomStageMemberTrack,
            leaveStageForGood: leaveStageForGood
        }}>
            {props.children}
        </StagesContext.Provider>
    );
}