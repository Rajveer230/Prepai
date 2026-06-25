import { useEffect } from "react"

export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} — PrepAI` : "PrepAI — AI Interview Coach"
        return () => { document.title = "PrepAI — AI Interview Coach" }
    }, [title])
}