import React, { useEffect, useState } from 'react';
import Video from './Video';
const Videos = (props) => {

    const [rVideos, setRVideos] = useState([])

    useEffect(() => {
        if (props.remoteStreams !== null && props.remoteStreams !== undefined)
            comingVideo(props.remoteStreams)
    }, [props])
    console.log(props.remoteStreams)
    const comingVideo = (remoteStreams) => {
        let _rVideos = remoteStreams.map((rVideo, index) => {
            let video = <Video
                idStyle={{
                    position: 'relative',
                    top: 2,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    textAlign: "center",
                    fontSize: 15,
                    color: "white"
                }}
                id={rVideo.id}
                videoStream={rVideo.stream}
                frameStyle={{ width: 120, float: 'left', padding: '0 3px' }}
                videoStyles={{ cursor: 'pointer', marginTop: -30, objectFit: 'cover', borderRadius: 3, width: '100%' }}
            />
            return (
                <div
                    id={rVideo.id}
                    onClick={() => props.switchVideo(rVideo)}
                    style={{ display: 'inline-block' }}
                    key={index}
                >
                    {video}
                </div>
            )
        })
        setRVideos(_rVideos)
    }

    return (
        <div
            style={{
                zIndex: 3, position: 'absolute', padding: '6px 3px', backgroundColor: 'rgba(0,0,0,0.3)',
                maxHeight: 120, top: 'auto', right: 10, left: 10, bottom: 60, overflowX: 'scroll', whiteSpace: 'nowrap'
            }}
        >
            {rVideos}
        </div>
    );
}

export default Videos;