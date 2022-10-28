import { useRouter } from "next/router";
import Image from "next/future/image";
import { NextPage } from "next";
import LoadingScreen from "@kratercord/common/components/layouts/main/LoadingScreen";

const FetchPage: NextPage = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <LoadingScreen Image={Image} navigate={navigate} />
}

export default FetchPage;