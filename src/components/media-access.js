export async function getDisplayStream() {
    const constraints = {
        video: true,
        audio: true
    }
    return navigator.mediaDevices.getDisplayMedia(constraints);
}