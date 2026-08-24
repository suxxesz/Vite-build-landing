const ApiData: { 
    API_URL: string, 
    USER_ID: string,
} = {   
    API_URL: (import.meta as any).env.VITE_MAIN_API_URL || '', 
    USER_ID: (import.meta as any).env.VITE_USER_ID || '', 
} as const 

export default ApiData