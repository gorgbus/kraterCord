import { GetServerSidePropsContext, NextPage } from "next"
import style from "./../styles/noaccess.module.scss";
import { FaLock } from "react-icons/fa";
import { useRouter } from "next/router";
import { validateCookies } from "./../utils/helpers";

const NoAccessPage: NextPage = () => {
    const router = useRouter();

    return (
        <div className={style.container}> 
            <div className={style.box}>
                <FaLock size={100} className={style.lock}/>

                <div className={style.top}>
                    <span>Tvůj účet nemá přístup.</span>
                    <span>text</span>
                </div>

                <div className={style.bottom}>
                    <button onClick={() => router.push("/")}>OK</button>
                </div>
            </div>

        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const headers = validateCookies(ctx);

  if (headers) return { redirect: { destination: "/channels/@me" } };

  return { props: {} }
}

export default NoAccessPage;