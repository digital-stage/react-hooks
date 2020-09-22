import React, {useEffect} from "react";
import SignUpForm from "../components/account/SignUpForm";
import Container from "../components/theme/Container";
import {HeadingLarge, ParagraphMedium} from "baseui/typography";
import TextLink from "../components/theme/TextLink";
import {useRouter} from "next/router";
import {useAuth} from "../lib/digitalstage/useAuth";
import Loading from "../components/theme/Loading";

const SignUp = () => {
    const router = useRouter();
    const {loading, user} = useAuth();

    useEffect(() => {
        router.prefetch("/signup");
    }, []);

    if( !loading ) {
        if( user ) {
            router.push("/");
        } else {
            return (
                <Container>
                    <HeadingLarge>Registration</HeadingLarge>
                    <SignUpForm targetUrl="/"/>
                    <ParagraphMedium>
                        oder <TextLink animateUnderline href="/login">melde Dich an</TextLink>
                    </ParagraphMedium>
                </Container>
            )
        }
    }

    return <Loading><HeadingLarge>Melde an...</HeadingLarge></Loading>;
};
export default SignUp;