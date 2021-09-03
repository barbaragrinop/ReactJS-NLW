import anwserdImg from '../assets/images/answer.svg';
import checkImg from '../assets/images/check.svg';
import imgLogo from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import '../styles/room.scss';
import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { UseAuth } from '../hooks/UseAuth';
import { database } from '../services/firebase';
import deleteImg from '../assets/images/delete.svg';
import { useEffect } from 'react';
import { Question } from '../components/Question/Index';
import { useRoom } from '../hooks/useRoom';

export function AdminRoom() {
    type RoomParams = {
        id: string;
    }

    const {user} = UseAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setNewQuestion] = useState('');
    const roomId = params.id;
    const {title, questions} = useRoom(roomId);

    console.log(questions)

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

    async function handleDeleteQuestion(questionId: string){
        if(window.confirm('Are u sure that u want to delete?')){
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
        }
    }

    async function handleHighlightedQuestion(questionId: string){
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighLighted: true,
        })
    }

    async function handleCheckQuestionAsAnwsered(questionId: string){
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnwsered: true
        })
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={imgLogo} alt="Logo Letmeask" />
                    <div>
                        <RoomCode code={params.id} />
                        <Button isOutlined>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span> }
                </div>
                
                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question 
                                key={question.id}
                                content={question.content} 
                                author={question.author} 
                                isAnwsered={question.isAnwsered} 
                                isHighlighted={question.isHighlighted}
                            >
                                <button type="button" onClick={() => {handleCheckQuestionAsAnwsered(question.id)}} > 
                                    <img src={checkImg} alt="marcar como respondida" />
                                </button>
                                <button type="button" onClick={() => {handleHighlightedQuestion(question.id)}} > 
                                    <img src={anwserdImg} alt="dar destaque a perguna" />
                                </button>
                                <button type="button" onClick={() => {handleDeleteQuestion(question.id)}} > 
                                    <img src={deleteImg} alt="deletar" />
                                </button>
                            </Question>
                        );
                    })}
                </div>

            </main>
        </div>
    );
}