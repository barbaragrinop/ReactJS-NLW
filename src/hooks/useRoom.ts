import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { UseAuth } from "./UseAuth";

type Questions = {
    id: string;
    author: {
        name: string, 
        avatar: string
    },
    content: string;
    isAnwsered?: boolean;
    isHighlighted?: boolean;
    likeCount: number;
    likeId: string | undefined;
}

type FirebaseQuestions = Record<string, {
    author: {
        name: string, 
        avatar: string
    },
    content: string;
    isAnwsered: boolean;
    isHighlighted: boolean,
    likes: Record<string, {
        authorId: string
    }>
}>;

export function useRoom(roomId: string){
    const {user} = UseAuth();
    const [questions, setQuestions] = useState<Questions[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);
        roomRef.on('value', room => {
            console.log("room",room )
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key, 
                    content: value.content, 
                    author: value.author, 
                    isHighlLighted: value.isHighlighted, 
                    isAnwsered: value.isAnwsered,
                    likeCount: Object.values(value.likes ?? {}).length, 
                    likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0]
                }
            });
            setTitle(databaseRoom.title);
            setQuestions(parsedQuestions);
            console.log("PARSED: ",parsedQuestions )
        });

        return() => {
            roomRef.off('value');
        }

    }, [roomId, user?.id]);
    return {questions, title}
    
}