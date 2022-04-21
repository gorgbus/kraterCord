import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const validateMiddlewareCookies = (req: NextRequest) => {
    const sessionID = req.cookies["connect.sid"];
    return sessionID ? ({
        Cookie: `connect.sid=${sessionID}`
    }) : false;
}

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const headers = validateMiddlewareCookies(req);
    const url = req.nextUrl.clone()
    const oldPath = url.pathname;
    

    url.pathname = "/";

    if (!headers) return NextResponse.redirect(url);

    url.pathname = `/app`

    NextResponse.next().cookie("path", oldPath);

    return NextResponse.redirect(url);
}