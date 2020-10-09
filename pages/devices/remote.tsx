import React from "react";
import Container from "../../components/theme/Container";
import DeviceView from "../../components/devices/DeviceView";
import useStageSelector from "../../lib/digitalstage/useStageSelector";

const Remote = () => {
    const {remoteDevices} = useStageSelector(state => ({
        remoteDevices: state.devices.remote.map(id => state.devices.byId[id])
    }));

    return (
        <Container>
            {remoteDevices && (
                <>
                    <h2>Meine anderen Geräte</h2>
                    {remoteDevices.map(remoteDevices => <DeviceView device={remoteDevices}/>)}
                </>
            )}
        </Container>
    );
}
export default Remote;