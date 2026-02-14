import SuccessEffect from '../../assets/audio/success-effect.mp3'

let audioInstance = null;
const vibrateWave = [80, 15, 80, 15, 40]

export const initAudio = () => {
    if (!audioInstance) {
        audioInstance = new Audio(SuccessEffect);
        audioInstance.volume = 0.7;
    }
};

export const unlockAudio = async () => {
    if (!audioInstance) return;

    try {
        audioInstance.volume = 0;
        await audioInstance.play();
        audioInstance.pause();
        audioInstance.currentTime = 0;
        audioInstance.volume = 0.7;
        console.log(audioInstance, 'a')
    } catch {
        console.log("autoplay blocked");
    }

};

export const playSuccessAudio = () => {
    if (!audioInstance) return;
    audioInstance.currentTime = 0;
    audioInstance.play().catch(() => { });
};

export const vibrateSuccess = () => {
    if (!audioInstance) return;
    navigator.vibrate?.(vibrateWave);
};