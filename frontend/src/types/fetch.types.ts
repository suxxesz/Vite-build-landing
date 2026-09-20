export interface IFormData  {
    name : string , 
    email : string
    field? : string , 
    subname? : string | null , 
    topic : string , 
    country : string  , 
    message :  string , 
}

export type TAsyncData<T> =  (formData : IFormData ) => Promise<T>

export interface TActivities {
    name : string
    type : number
    url: string
    details: any,
    state : any
    applicationId: string,
      timestamps: {
        start: Date,
        end: any | null
      },
      party: any,
      syncId: any,
      assets: any,
      flags: number,
      emoji: string | null,
      buttons: [],
      createdTimestamp: Date
}