import copyImg from '../assets/images/copy.svg';
import '../styles/room-code.scss';

type RoomCodeProps = {
    code: string;
}

export function RoomCode(props: RoomCodeProps) {
    function CopyRoomCodeToClipBoard(){
        navigator.clipboard.writeText(props.code);
    }

    return(  
        <button className="room-code" onClick={CopyRoomCodeToClipBoard}>
            <div>
                <img src={copyImg} alt="copy room code" />
            </div>
            <span>{props.code}</span>
        </button>
    )
}