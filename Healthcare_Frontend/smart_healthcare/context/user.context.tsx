"use client"

import { AppProviderProps, UserContextType } from "@/type";
import React, { createContext,useContext,useState } from "react";
import { IUser } from "@/type";
import { Toaster } from "react-hot-toast";
const UserContext = createContext<UserContextType|undefined>(undefined)

export const Userprovider:React.FC<AppProviderProps>=({children})=>{
    const [user,setUser]=useState<IUser|null>(null)
    const [loading,setLoading]=useState<boolean>(true)
    const [btnLoading,setBtnLoading]=useState<boolean>(false)
    const [isAuth,setIsAuth]=useState<boolean>(false)
    
    return <>
    <UserContext.Provider value={{user,setUser,isAuth,setIsAuth,loading,setLoading,btnLoading,setBtnLoading}}>
        {children}
        <Toaster/>
    </UserContext.Provider>
    </>
}
export const useAppData = ():UserContextType => {
  const context = useContext(UserContext);
if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
    return context;
}