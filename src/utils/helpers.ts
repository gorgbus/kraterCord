import { GetServerSidePropsContext } from "next";

export const validateCookies = (context: GetServerSidePropsContext) => {
    const sessionID = context.req.cookies["connect.sid"];
    return sessionID ? ({
        Cookie: `connect.sid=${sessionID}`
    }) : false;
}