import React, {useCallback, useEffect, useReducer, useState} from "react";
import {Producer, ProducerId, Router} from "../common/model.common";
import {useDevices} from "../useDevices";
import {ClientDeviceEvents, ServerDeviceEvents, ServerStageEvents} from "../common/events";
import mediasoupClient from 'mediasoup-client';
import {Device as MediasoupDevice} from 'mediasoup-client/lib/Device'
import {
    closeConsumer,
    createConsumer,
    createProducer,
    createWebRTCTransport,
    getFastestRouter,
    getUrl, resumeConsumer,
    RouterGetUrls,
    stopProducer
} from "./util";
import Client from "../common/model.client";


export interface MediasoupContextProps {
    working: boolean;
    localProducers: Client.LocalProducer[];
    remoteProducers: Producer[];
    localConsumers: Client.LocalConsumer[];
}

const MediasoupContext = React.createContext<MediasoupContextProps>(undefined);

export const useMediasoup = (): MediasoupContextProps => React.useContext<MediasoupContextProps>(MediasoupContext);

export const MediasoupProvider = (props: {
    children: React.ReactNode
}) => {
    const {socket, localDevice} = useDevices();
    const [sendVideo, setSendVideo] = useState<boolean>(localDevice && localDevice.sendVideo);
    const [sendAudio, setSendAudio] = useState<boolean>(localDevice && localDevice.sendAudio);
    const [receiveAudio, setReceiveAudio] = useState<boolean>(localDevice && localDevice.receiveAudio);
    const [receiveVideo, setReceiveVideo] = useState<boolean>(localDevice && localDevice.receiveVideo);
    const [router, setRouter] = useState<Router>();

    const [working, setWorking] = useState<boolean>(false);

    // For mediasoup
    const [device, setDevice] = useState<mediasoupClient.types.Device>();
    const [sendTransport, setSendTransport] = useState<mediasoupClient.types.Transport>();
    const [receiveTransport, setReceiveTransport] = useState<mediasoupClient.types.Transport>();

    // Local producers
    const [localProducers, setLocalProducers] = useState<Client.LocalProducer[]>([]);

    // Remote offers
    const [localConsumers, setLocalConsumers] = useState<Client.LocalConsumer[]>([]);
    const [remoteProducers, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case "add":
                const producer: Producer = action.payload;
                console.log("dispatch: add " + producer._id);
                if (router && device && receiveTransport && localDevice) {
                    if ((producer.kind === "audio" && localDevice.receiveAudio) ||
                        producer.kind === "video" && localDevice.receiveVideo) {
                        setWorking(true);
                        createConsumer(router, device, receiveTransport, producer)
                            .then(consumer => {
                                if (consumer.paused)
                                    return resumeConsumer(router, consumer);
                                return consumer;
                            })
                            .then(consumer => {
                                setLocalConsumers(prevState => [...prevState, {
                                    remoteProducer: producer,
                                    msConsumer: consumer
                                }]);
                            })
                            .catch(error => console.log(error))
                            .finally(() => setWorking(false));
                    }
                }
                return [...state, producer];
            case "add_many":
                console.log("dispatch: add_many ");
                const producers: Producer[] = action.payload;
                if (localDevice) {
                    setWorking(true);
                    Promise.all(producers.map(producer => {
                        if ((producer.kind === "audio" && localDevice.receiveAudio) ||
                            producer.kind === "video" && localDevice.receiveVideo) {
                            return createConsumer(router, device, receiveTransport, producer)
                                .then(consumer => {
                                    if (consumer.paused)
                                        return resumeConsumer(router, consumer);
                                    return consumer;
                                })
                                .then(consumer => {
                                    setLocalConsumers(prevState => [...prevState, {
                                        remoteProducer: producer,
                                        msConsumer: consumer
                                    }]);
                                })
                                .catch(error => console.log(error))
                        }
                    }))
                        .finally(() => setWorking(false));
                }
                return [...state, ...producers];
            case "update":
                const update: Producer = action.payload;
                console.log("dispatch: update " + update._id);
                setLocalConsumers(prevState => prevState.map(consumer => consumer.remoteProducer._id === update._id ? {
                    ...consumer,
                    remoteProducer: {
                        ...consumer.remoteProducer,
                        ...update
                    }
                } : consumer));
                return state.map(p => p._id === update._id ? {...p, ...update} : p);
            case "remove":
                console.log("dispatch: remove " + action.payload);
                const id: ProducerId = action.payload;
                const consumer = localConsumers.find(consumer => consumer.remoteProducer._id === id);
                if (consumer) {
                    setWorking(true);
                    closeConsumer(router, consumer.msConsumer)
                        .catch(error => console.error(error))
                        .finally(() => {
                            setLocalConsumers(prevState => prevState.filter(c => c.remoteProducer._id !== id));
                            setWorking(false);
                        });
                }
                return state.filter(i => i._id !== id);
            case "receive-audio":
                setWorking(true);
                if (action.payload) {
                    Promise.all(state.filter(remoteProducers => remoteProducers.kind === "audio").map(remoteProducer => {
                        return createConsumer(router, device, receiveTransport, remoteProducer)
                            .then(consumer => {
                                if (consumer.paused)
                                    return resumeConsumer(router, consumer);
                                return consumer;
                            })
                            .then(consumer => {
                                setLocalConsumers(prevState => [...prevState, {
                                    remoteProducer: remoteProducer,
                                    msConsumer: consumer
                                }]);
                            })
                    }))
                        .finally(() => setWorking(false));
                } else {
                    // Remote all video consumers
                    Promise.all(localConsumers.filter(consumer => consumer.remoteProducer.kind === "audio").map(consumer => {
                        return closeConsumer(router, consumer.msConsumer)
                            .finally(() => setLocalConsumers(prevState => prevState.filter(c => c.remoteProducer._id !== consumer.remoteProducer._id)))
                    }))
                        .finally(() => setWorking(false));
                }
                return state;
            case "receive-video":
                setWorking(true);
                if (action.payload) {
                    Promise.all(state.filter(remoteProducers => remoteProducers.kind === "video").map(remoteProducer => {
                        return createConsumer(router, device, receiveTransport, remoteProducer)
                            .then(consumer => {
                                if (consumer.paused)
                                    return resumeConsumer(router, consumer);
                                return consumer;
                            })
                            .then(consumer => {
                                console.log("Adding local consumer");
                                setLocalConsumers(prevState => [...prevState, {
                                    remoteProducer: remoteProducer,
                                    msConsumer: consumer
                                }]);
                            })
                    }))
                        .catch(error => console.error(error))
                        .finally(() => setWorking(false));
                } else {
                    // Remote all video consumers
                    Promise.all(localConsumers.filter(consumer => consumer.remoteProducer.kind === "video").map(consumer => {
                        return closeConsumer(router, consumer.msConsumer)
                            .finally(() => setLocalConsumers(prevState => prevState.filter(c => c.remoteProducer._id !== consumer.remoteProducer._id)))
                    }))
                        .catch(error => console.error(error))
                        .finally(() => setWorking(false));
                }
                return state;
            case "reset":
                console.log("dispatch: reset");
                setWorking(true);
                Promise.all(
                    localConsumers.map(consumer => closeConsumer(router, consumer.msConsumer))
                )
                    .catch(error => console.error(error))
                    .finally(() => {
                        setLocalConsumers([]);
                        setWorking(false);
                    });
                return [];
        }
        return state;
    }, []);

    useEffect(() => {
        connect()
            .catch((error) => {
                console.error(error);
            });

        return () => {
            console.log("[useMediasoup] Disconnecting");
        }
    }, []);

    useEffect(() => {
        if (receiveTransport)
            return () => {
                console.log("[useMediasoup] Disconnecting receive transport");
                receiveTransport.close();
            }
    }, [receiveTransport]);

    useEffect(() => {
        if (sendTransport) {
            return () => {
                console.log("[useMediasoup] Disconnecting send transport");
                sendTransport.close();
            }
        }
    }, [sendTransport]);

    const connect = useCallback(() => {
        return getFastestRouter()
            .then(router => {
                setRouter(router);
                fetch(getUrl(router, RouterGetUrls.GetRTPCapabilities))
                    .then(result => result.json())
                    .then((rtpCapabilities: mediasoupClient.types.RtpCapabilities) => {
                        const handleDisconnect = () => {
                            console.error("Connected disconnected by server");
                        };
                        const device = new MediasoupDevice();
                        device.load({routerRtpCapabilities: rtpCapabilities})
                            .then(() => {
                                createWebRTCTransport(router, device, 'send', handleDisconnect)
                                    .then(transport => setSendTransport(transport));
                                createWebRTCTransport(router, device, 'receive', handleDisconnect)
                                    .then(transport => setReceiveTransport(transport));
                            })
                            .then(() => setDevice(device));
                    });
            });
    }, [])


    const startSending = useCallback((kind: "audio" | "video") => {
        console.log("startSending " + kind);
        setWorking(true);
        return navigator.mediaDevices.getUserMedia({
            video: kind === "video" ? {
                deviceId: localDevice.inputVideoDevice
            } : undefined,
            audio: kind === "audio" ? {
                deviceId: localDevice.inputAudioDevice,
                autoGainControl: false,
                echoCancellation: false,
                noiseSuppression: false
            } : undefined,
        })
            .then(stream => {
                console.log(stream);
                return stream;
            })
            .then(stream => {
                if (kind === "video") {
                    const videoTracks = stream.getVideoTracks();
                    if (videoTracks.length > 0)
                        return [videoTracks[0]];
                    return [];
                }
                return stream.getAudioTracks();
            })
            .then(tracks =>
                Promise.all(tracks.map(track => {
                        return createProducer(sendTransport, track)
                            .then(msProducer => {
                                return new Promise(resolve => {
                                    socket.emit(ClientDeviceEvents.ADD_PRODUCER, {
                                        kind: kind,
                                        routerId: router._id,
                                        routerProducerId: msProducer.id
                                    }, (producer: Producer) => {
                                        console.log("Created remote producer " + producer._id);
                                        setLocalProducers(prevState => [...prevState, {
                                            ...producer,
                                            msProducer: msProducer
                                        }]);
                                        resolve();
                                    });
                                });
                            })
                    }
                ))
            )
            .finally(() => setWorking(false));
    }, [localDevice, sendTransport, localProducers]);

    const stopSending = useCallback((kind: "audio" | "video") => {
        console.log("stopSending " + kind);
        setWorking(true);
        return Promise.all(localProducers.filter(msProducer => msProducer.kind === kind)
            .map(producer => stopProducer(router, producer.msProducer)
                .then(() => new Promise(resolve => {
                    console.log("Removing remote producer " + producer._id);
                    socket.emit(ClientDeviceEvents.REMOVE_PRODUCER, producer._id, () => {
                        setLocalProducers(prevState => prevState.filter(p => p._id !== producer._id));
                        resolve();
                    });
                }))
            ))
            .finally(() => setWorking(false));
    }, [localDevice, sendTransport, localProducers]);

    useEffect(() => {
        if (router && device && receiveTransport && sendTransport && localDevice) {
            // Requirements matched
            if (!working) {
                console.log("ready again");
                if (localDevice.sendVideo !== sendVideo) {
                    setSendVideo(localDevice.sendVideo);
                    if (localDevice.sendVideo) {
                        startSending("video");
                    } else {
                        stopSending("video");
                    }
                }
                if (localDevice.sendAudio !== sendAudio) {
                    setSendAudio(localDevice.sendAudio);
                    if (localDevice.sendAudio) {
                        startSending("audio");
                    } else {
                        stopSending("audio");
                    }
                }
                if (localDevice.receiveAudio !== receiveAudio) {
                    setReceiveAudio(localDevice.receiveAudio);
                    dispatch({type: "receive-audio", payload: localDevice.receiveAudio});
                }
                if (localDevice.receiveVideo !== receiveVideo) {
                    setReceiveVideo(localDevice.receiveVideo);
                    dispatch({type: "receive-video", payload: localDevice.receiveVideo});
                }
            } else {
                console.log("still working");
            }
        }

    }, [router, device, receiveTransport, sendTransport, localDevice, working]);

    useEffect(() => {
        if (socket) {
            socket.on(ServerStageEvents.STAGE_PRODUCER_ADDED, producer => dispatch({type: 'add', payload: producer}));
            socket.on(ServerStageEvents.STAGE_PRODUCER_CHANGED, producer => dispatch({
                type: 'update',
                payload: producer
            }));
            socket.on(ServerStageEvents.STAGE_PRODUCER_REMOVED, producerId => dispatch({
                type: 'remove',
                payload: producerId
            }));
            socket.on(ServerStageEvents.STAGE_JOINED, (payload: {
                producers: Producer[];
            }) => {
                dispatch({type: 'add_many', payload: payload.producers});
            });
            socket.on(ServerStageEvents.STAGE_LEFT, (payload: {
                producers: Producer[];
            }) => {
                dispatch({type: 'reset'});
            });
            socket.on("disconnect", () => {
                dispatch({type: 'reset'});
                setLocalProducers([]);
                setLocalConsumers([]);
            })

            return () => {
                console.log("[useMediasoup] Cleaning up");
                stopSending("audio");
                stopSending("video");
                dispatch({type: 'reset'});
                setSendAudio(false);
                setSendVideo(false);
                setReceiveAudio(false);
                setReceiveVideo(false);
                setReceiveTransport(undefined);
                setSendTransport(undefined);
                setDevice(undefined);
            }
        }
    }, [socket]);

    return (
        <MediasoupContext.Provider value={{
            working: working,
            localProducers: localProducers,
            remoteProducers: remoteProducers,
            localConsumers: localConsumers
        }}>
            {props.children}
        </MediasoupContext.Provider>
    )
}

export default useMediasoup;