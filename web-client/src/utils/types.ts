import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<T> = NextPage<T> & {
    getLayout?: (page: ReactElement) => ReactNode;
    app: boolean;
};

export type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout<any>;
};