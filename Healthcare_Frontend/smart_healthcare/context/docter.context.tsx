"use client"

import { AppProviderProps, IUserDoctor, UserContextType,DoctorContextType } from "@/type";
import React, { createContext,useContext,useState } from "react";
import { Toaster } from "react-hot-toast";
const DoctorContext = createContext<DoctorContextType|undefined>(undefined)

export const Doctorprovider:React.FC<AppProviderProps>=({children})=>{
    const [doctor,setDoctor]=useState<IUserDoctor|null>(null)
    const [loading2,setLoading2]=useState<boolean>(true)
    const [btnLoading2,setBtnLoading2]=useState<boolean>(false)
    const [isAuth2,setIsAuth2]=useState<boolean>(false)
    
    return <>
    <DoctorContext.Provider value={{doctor,setDoctor,isAuth2,setIsAuth2,loading2,setLoading2,btnLoading2,setBtnLoading2}}>
        {children}
        <Toaster/>
    </DoctorContext.Provider>
    </>
}
export const useDoctorData = ():DoctorContextType => {
  const context = useContext(DoctorContext);
if (!context) {
    throw new Error("useDoctorData must be used within an AppProvider");
  }
    return context;
}