import { TActivities } from "./fetch.types"
export  interface IAudioContext  {
    song : HTMLAudioElement | null,
     isPaused : boolean,
        isStarted : boolean,
        image : string,
        title : string,
        play : () => void,
        pause : () => void,
        togglePlay : () => void,
        next : () => void,
        prev : () => void,
        preload : () => void,
        preloadState : boolean,
        iconSize : number
}
export interface IOverlayContext {
    onClose : () => void,
    hasOpened : boolean
}
export interface ICopyContext {
            subname: string,
    
            src: string ,
    
            id: string,
    
            name: string
    
            href: string,
    
            time: string,
    
            status : string ,
            activities :  | TActivities[]
}
export type CopyContextType = ICopyContext & IUseCopy
export interface IUseCopy {
            isCopied : boolean,
            countOfCopy : number,
            copyInner : string,
            copyOnClipboard : (text: string) => Promise<void>
            onMouseLeaveCopyState : () => void,
}