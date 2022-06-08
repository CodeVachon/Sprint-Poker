import { ClassNames } from "@44north/classnames";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Homepage() {
    const { data } = useSession();

    const buttonClasses = new ClassNames([
        "bg-yellow-500 py-2 px-4",
        "rounded shadow",
    ]);
    return (
        <div
            className={new ClassNames([
                "h-screen flex justify-center items-center",
                "bg-slate-700",
            ]).list()}
        >
            <div
                className={new ClassNames([
                    "bg-white rounded border shadow p-4 w-1/3",
                ]).list()}
            >
                {data ? (
                    <Link href="/play">
                        <a className={buttonClasses.list()}>Play</a>
                    </Link>
                ) : (
                    <button
                        className={buttonClasses.list()}
                        onClick={() => signIn()}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );
}
