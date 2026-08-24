

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.img' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_API_URL: string;
  readonly VITE_BOT_API_URL: ImportMetaEnv;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
   readonly BASE_URL: string
}

declare namespace NodeJS {
   interface ProcessEnv {
    VITE_MAIN_API_URL : string 
     VITE_USER_ID :  string
}
}