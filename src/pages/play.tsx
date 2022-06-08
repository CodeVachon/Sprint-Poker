import Head from "next/head";

import io, { Socket } from "socket.io-client";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Card } from "src/components/card";
import { ClassNames } from "@44north/classnames";
import { EventName } from "src/shared/socketName";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Gravatar from "react-gravatar";

const initializeSocket = () => {
    return new Promise<Socket>(async (resolve, reject) => {
        try {
            await fetch("/api/socket");
        } catch (e) {
            reject(e);
        }

        const socket = io();

        socket.on("connect", () => {
            console.log("Socket Connected");

            resolve(socket);
        });
    });
};

const availableCardValues = [1, 2, 3, 5, 8, 13];

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [socket, setSocket] = useState<Socket>();
    const [selectValue, setSelectValue] = useState<number>();
    const [receivedCards, setReceivedCards] = useState<
        Array<{ user: { email: string; name: string }; value: number }>
    >([]);
    const [revealHand, setRevealHand] = useState<boolean>(false);

    const resetDeck = () => {
        setSelectValue(undefined);
        setRevealHand(false);
    };

    useEffect(() => {
        if (!socket) {
            initializeSocket().then((mySocket) => {
                mySocket.on(EventName.RESET_REQUESTED, () => {
                    console.log("Reset was Requested");
                    resetDeck();
                });

                mySocket.on(EventName.CARD_SELECT_REQUESTED, (data) => {
                    console.log("CARD_SELECT_REQUESTED", { data });
                    setReceivedCards((receivedCards) => {
                        const newSet = receivedCards.filter(
                            (card) => card.user.email !== data.user.email
                        );

                        newSet.push(data);

                        return newSet;
                    });
                });

                mySocket.on(EventName.CARD_REMOVED_REQUESTED, (data) => {
                    console.log("CARD_REMOVED_REQUESTED", { data });
                    setReceivedCards((receivedCards) => {
                        const newSet = receivedCards.filter(
                            (card) => card.user.email !== data.user.email
                        );

                        return newSet;
                    });
                });

                mySocket.on(EventName.REVEAL_REQUESTED, () => {
                    console.log("REVEAL_REQUESTED");
                    setRevealHand(true);
                });

                setSocket(mySocket);
            });
        }
    }, []);

    useEffect(() => {
        if (socket) {
            if (selectValue) {
                socket.emit(EventName.CARD_SELECTED, {
                    user: session.user,
                    value: selectValue,
                });
            } else {
                socket.emit(EventName.CARD_REMOVED, {
                    user: session.user,
                    value: selectValue,
                });
            }
        }
    }, [selectValue]);

    if (status === "loading") {
        return <p>Loading...</p>;
    } else if (status === "unauthenticated") {
        router.push("/");
    }

    const onCardClick = (event: React.MouseEvent, value: number) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (value === selectValue) {
            setSelectValue(undefined);
        } else {
            setSelectValue(value);
        }
    };

    const onResetDeckClick = () => {
        if (socket) {
            socket.emit(EventName.RESET);
        } else {
            throw new Error("Socket Not Found");
        }
    };

    const onRevealHandClick = () => {
        console.log("onRevealHandClick");
        if (socket) {
            socket.emit(EventName.REVEAL);
        } else {
            throw new Error("Socket Not Found");
        }
    };

    return (
        <div className={"h-screen flex flex-col"}>
            <Head>
                <title>Sprint Poker</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header className={new ClassNames(["bg-green-700 p-4"]).list()}>
                <ol
                    className={new ClassNames([
                        "flex justify-around items-center",
                        "max-w-6xl m-auto",
                    ]).list()}
                >
                    {availableCardValues.map((value) => (
                        <li key={`cardValue-${value}`}>
                            <div
                                onClick={(e) => {
                                    onCardClick(e, value);
                                }}
                                className={new ClassNames([
                                    "w-24 h-36",
                                    "cursor-pointer",
                                    "bg-white",
                                    "border-4 rounded shadow hover:shadow-2xl",
                                    "flex items-center justify-center",
                                    "hover:scale-110 transition-transform duration-300",
                                    "text-3xl",
                                ])
                                    .add({
                                        "border-red-500 scale-105":
                                            selectValue === value,
                                    })
                                    .list()}
                            >
                                {value}
                            </div>
                        </li>
                    ))}
                </ol>
            </header>
            <main
                className={new ClassNames([
                    "flex-grow",
                    "flex justify-around items-center space-x-4 space-y-4",
                    "p-4",
                    "bg-slate-700",
                ]).list()}
            >
                {receivedCards.map((card) => {
                    return (
                        <div
                            key={card.user.email}
                            className={new ClassNames([
                                "flex flex-col space-y-2 justify-center items-center",
                            ]).list()}
                        >
                            {revealHand ? (
                                <div
                                    className={new ClassNames([
                                        "w-36 h-52",
                                        "text-6xl",
                                        "flex items-center justify-center",
                                        "bg-white rounded border shadow",
                                    ]).list()}
                                >
                                    <p>{card.value}</p>
                                </div>
                            ) : (
                                <Card
                                    className={new ClassNames([
                                        "w-36 h-52",
                                        "bg-white rounded border shadow",
                                    ]).list()}
                                />
                            )}

                            <div
                                className={new ClassNames([
                                    "flex space-x-2 items-center",
                                ]).list()}
                            >
                                <Gravatar
                                    email={card.user.email}
                                    className={new ClassNames([
                                        "rounded-full w-8 h-8",
                                    ]).list()}
                                />
                                <p
                                    className={new ClassNames([
                                        "text-white",
                                    ]).list()}
                                >
                                    {card.user.name}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </main>
            <footer
                className={new ClassNames([
                    "bg-green-700 p-4",
                    "flex justify-between items-center",
                ]).list()}
            >
                <div className={new ClassNames(["flex space-x-2"]).list()}>
                    <Button onClick={onResetDeckClick}>Reset</Button>
                    <Button onClick={onRevealHandClick}>Reveal</Button>
                </div>
                <div
                    className={new ClassNames([
                        "flex space-x-2 items-center",
                    ]).list()}
                >
                    <Gravatar
                        email={session.user.email}
                        className={new ClassNames([
                            "rounded-full w-8 h-8",
                        ]).list()}
                    />
                    <p>{session.user.name}</p>
                </div>
            </footer>
        </div>
    );
}

const Button: FC<{ onClick: () => void; children: ReactNode }> = ({
    onClick,
    children,
}) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            onClick();
        }}
        className={new ClassNames([
            "bg-red-500 text-white px-4 py-2 rounded",
            "hover:bg-red-400",
        ]).list()}
    >
        {children}
    </button>
);
