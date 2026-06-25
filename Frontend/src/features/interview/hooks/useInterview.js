import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"
import { useToast } from "../../../utils/toast"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) throw new Error("useInterview must be used within an InterviewProvider")

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const { showToast } = useToast()

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to generate report.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to load report.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to load reports.")
            return null
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            const title = report?.title || "interview-plan"
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            link.setAttribute("download", `${slug}.pdf`)
            document.body.appendChild(link)
            link.click()
        } catch (error) {
            showToast("Failed to download PDF.")
        } finally {
            setLoading(false)
        }
    }

    const deleteReport = async (interviewId) => {
        try {
            await deleteInterviewReport(interviewId)
            setReports(prev => prev.filter(r => r._id !== interviewId))
            showToast("Interview plan deleted.", "success")
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to delete report.")
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }
}