import Container from "../components/theme/Container";
import React, {useEffect, useState} from "react";
import {useAuth} from "../lib/digitalstage/useAuth";
import Loading from "../components/theme/Loading";
import {DisplayMedium, HeadingLarge} from "baseui/typography";
import Login from "./login";
import StageListView from "../components/stage/StageListView";
import {useStages} from "../lib/digitalstage/useStages";
import {useRouter} from "next/router";


const Stages = () => {
    const router = useRouter();
    const {loading, user} = useAuth();
    const {stageId} = useStages();
    const [initialized, setInitialized] = useState<boolean>();

    if (loading) {
        return <Loading>
            <DisplayMedium>Loading ...</DisplayMedium>
        </Loading>;
    }

    if (!user) {
        return <Login/>
    }

    useEffect(() => {
        if (initialized) {
            if (stageId) {
                router.push("/");
            }
        }
    }, [stageId]);

    useEffect(() => {
        if (router.pathname === "/stages") {
            setInitialized(true);
        }
    }, [router.pathname]);

    return (
        <Container>
            <HeadingLarge>Meine Bühnen</HeadingLarge>
            <StageListView/>
        </Container>
    );
}
export default Stages;