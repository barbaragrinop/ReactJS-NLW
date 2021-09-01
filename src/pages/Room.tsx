import imgLogo from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { UseAuth } from '../hooks/UseAuth';
import { database } from '../services/firebase';
import { useEffect } from 'react';
import { Question } from '../components/Question/Index';

export function Room() {
    type RoomParams = {
        id: string;
    }

    type FirebaseQuestions = Record<string, {
        author: {
            name: string, 
            avatar: string
        },
        content: string;
        isAnwsered: boolean;
        isHighlighted: boolean
    }>;

    type Questions = {
        id: string;
        author: {
            name: string, 
            avatar: string
        },
        content: string;
        isAnwsered: boolean;
        isHighlighted: boolean

    }

    const {user} = UseAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const roomId = params.id;
    const [questions, setQuestios] = useState<Questions[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`);
        roomRef.on('value', room => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key, 
                    content: value.content, 
                    author: value.author, 
                    isHighlighted: value.isHighlighted, 
                    isAnwsered: value.isAnwsered
                }
            });
            setTitle(databaseRoom.title);
            setQuestios(parsedQuestions);
        });

    }, [roomId]);

    async function handleSentQuestion(event: FormEvent){
        event.preventDefault();
        console.log(user);

        if(newQuestion.trim() === ''){
            return;
        }

        if(!user){
            throw new Error('You must be logged in');
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar
            }, 
            isHighLighted: false,
            isAnwsered: false
        };

        await database.ref(`rooms/${roomId}/questions`).push(question);
        setNewQuestion('');
    }


    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={imgLogo} alt="Logo Letmeask" />
                    <RoomCode code={params.id} />
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
                </div>
                <form onSubmit={handleSentQuestion}>
                    <textarea 
                        placeholder="O que quer perguntar?"
                        onChange={event => setNewQuestion(event.target.value)}
                        value = {newQuestion}
                    />

                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>     
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>                  
                    </div>
                </form>
                
                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question key={question.id} content={question.content} author={question.author} />
                        );
                    })}
                </div>

            </main>
        </div>
    );
}