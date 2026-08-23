"use client"

import { useState } from "react"

export default function Chat () {
    const [message, setMessage] = useState("");
    return(
        <>
        <form action="">
            <input value={message} onChange={(e) => setMessage(e.target.value)} type="text" />
        </form>
        </>
    )
}